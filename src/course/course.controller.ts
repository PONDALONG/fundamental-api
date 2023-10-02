import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from "@nestjs/common";
import { CourseCreateRequestDto } from "./dto/course-create-request.dto";
import { CourseService } from "./course.service";
import { Res } from "../utils/Res";
import { AdminGuard } from "../auth/admin.guard";
import { AuthGuard } from "../auth/auth.guard";
import { User } from "../user/entities/user.entity";

@Controller("course")
export class CourseController {
  private readonly response = new Res();

  constructor(
    private readonly service: CourseService
  ) {
  }

  @UseGuards(AdminGuard)
  @Post("create")
  @HttpCode(HttpStatus.OK)
  async create(@Body() input: CourseCreateRequestDto, @Request() auth: any) {
    try {
      await this.service.create(input);
      return this.response.ok();
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(AdminGuard)
  @Get("findAll")
  @HttpCode(HttpStatus.OK)
  async findAll() {
    try {
      return await this.service.findAll();
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(AuthGuard)
  @Get("findAllByUser")
  @HttpCode(HttpStatus.OK)
  async findAllByUser(@Request() auth: any) {
    try {
      return await this.service.findAllByUser(auth["user"] as User);
    } catch (e) {
      throw e;
    }
  }
}