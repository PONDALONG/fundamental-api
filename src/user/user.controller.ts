import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UserService } from "./user.service";
import { AuthGuard } from "../auth/auth.guard";
import { User } from "./entities/user.entity";
import { Res } from "../utils/Res";
import { LoginRequest } from "./dto/user.model";

@Controller("user")
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  private readonly response = new Res();

  constructor(
    private readonly service: UserService
  ) {
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() req: LoginRequest) {
    try {
      console.log(req);
      return await this.service.login(req);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Get("profile")
  @HttpCode(HttpStatus.OK)
  async profile(@Request() auth: any) {
    return auth.user as User;
  }

  @UseGuards(AuthGuard)
  @Post("change-password")
  @HttpCode(HttpStatus.OK)
  async changePassword(@Request() auth: any, @Body() body: any) {
    //todo: change password
  }

  @UseGuards(AuthGuard)
  @Post("update-profile")
  @UseInterceptors(FileInterceptor("file"))
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Request() auth: any, @UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 1000 * 1000 * 5 }),
        new FileTypeValidator({ fileType: "jpeg|png" })
      ]
    })
  ) file?: Express.Multer.File) {
    try {
      return await this.service.updateProfile(file, auth.user);
    } catch (e) {
      throw e;
    }
  }
}
