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
import { MyLogger } from "../ีutils/MyLogger";
import { Res } from "../ีutils/Res";
import { AdminGuard } from "../auth/admin.guard";

@Controller("user")
export class UserController {
  private readonly logger = new MyLogger(UserController.name);
  private readonly response = new Res();
  private readonly transaction: string = new Date().getTime().toString();

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
  async imports(@UploadedFile() file: Express.Multer.File, @Request() auth: any) {

    const user: User = auth.user as User;
    this.logger.logStart(this.transaction, this.imports.name, user.studentId, user.role);
    this.logger.logInfo(this.transaction, user.studentId, user.role, file.originalname);

    try {

      await this.service.imports(file);

      return this.response.ok();

    } catch (e) {
      throw e;

    } finally {

      this.logger.logEnd(this.transaction, this.imports.name, user.studentId, user.role);

    }
  }

  @UseGuards(AuthGuard)
  @Get("profile")
  @HttpCode(HttpStatus.OK)
  async profile(@Request() auth: any) {

    const user: User = auth.user as User;
    this.logger.logStart(this.transaction, this.profile.name, user.studentId, user.role);
    this.logger.logInfo(this.transaction, user.studentId, user.role);

    try {
      
      return user;

    } catch (e) {
      throw e;

    } finally {

      this.logger.logEnd(this.transaction, this.profile.name, user.studentId, user.role);

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
