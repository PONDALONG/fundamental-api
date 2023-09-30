import {
  Body,
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
      return await this.service.login(req);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post("imports")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor("file"))
  @UseGuards(AdminGuard)
  async imports(@Request() auth: any, @UploadedFile() file: Express.Multer.File, @Body() body: any) {

    try {
      await this.service.imports(file);
      return this.response.ok();
    } catch (e) {
      throw e;

    } finally {
    }
  }

  @UseGuards(AuthGuard)
  @Get("profile")
  @HttpCode(HttpStatus.OK)
  async profile(@Request() auth: any) {
    return auth.user as User;
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  async findOne(@Param("id") id: number) {
    try {
      return await this.service.findOne(id);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
