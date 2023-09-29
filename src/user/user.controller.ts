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
import { loginRequestDto } from "./dto/login-request.dto";
import { UserService } from "./user.service";
import { AuthGuard } from "../auth/auth.guard";
import { User } from "./entities/user.entity";

@Controller("user")
export class UserController {
  constructor(
    private readonly service: UserService
  ) {
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() req: loginRequestDto) {
    try {
      return await this.service.login(req);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }

  }

  @Post("imports")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor("file"))

  async imports(@UploadedFile() file: Express.Multer.File) {
    try {
      await this.service.imports(file);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Get("profile")
  @HttpCode(HttpStatus.OK)
  async profile(@Request() req: any) {
    try {
      return await this.service.checkUser(req.user as User);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
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
