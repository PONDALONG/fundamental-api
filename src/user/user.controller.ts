import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { LoginRequestDto } from "./dto/login-request.dto";
import { UserService } from "./user.service";
import { AuthGuard } from "../auth/auth.guard";
import { User } from "./entities/user.entity";
import { Res } from "../utils/Res";
import { AdminGuard } from "../auth/admin.guard";

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
  async login(@Body() req: LoginRequestDto) {
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
}
