import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UserService } from "./user.service";
import { AuthGuard } from "../auth/auth.guard";
import { ResP } from "../utils/ResP";
import { ChangePassword, LoginRequest, resetPassword, UpdateStatus } from "./dto/user.model";
import { AdminGuard } from "../auth/admin.guard";

@Controller("user")
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  private readonly response = new ResP();

  constructor(
    private readonly service: UserService
  ) {
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() req: LoginRequest) {
    try {
      return await this.service.login(req);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Get("me")
  @HttpCode(HttpStatus.OK)
  async me(@Request() auth: any) {
    return this.service.me(auth.user);
  }

  @UseGuards(AuthGuard)
  @Post("change-password")
  @HttpCode(HttpStatus.OK)
  async changePassword(@Request() auth: any, @Body() input: ChangePassword) {
    try {
      await this.service.changePassword(auth.user, input);
      return this.response.ok();
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(AdminGuard)
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() input: resetPassword) {
    try {
      await this.service.resetPassword(input.userId);
    } catch (e) {
      throw e;
    }
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

  @UseGuards(AdminGuard)
  @Post("update-status")
  @HttpCode(HttpStatus.OK)
  async updateStatus(@Body() input: UpdateStatus) {
    try {
      return await this.service.updateStatus(input);
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(AdminGuard)
  @Delete("delete")
  @HttpCode(HttpStatus.OK)
  async delete(@Query("userId") userId: number) {
    try {
      await this.service.delete(userId);
      return this.response.ok();
    } catch (e) {
      throw e;
    }
  }
}
