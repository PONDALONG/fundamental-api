import { Body, Controller, HttpCode, HttpStatus, Post, Request, UseGuards } from "@nestjs/common";
import { CourseCreateRequestDto } from "./dto/course-create-request.dto";
import { CourseService } from "./course.service";
import { Res } from "../utils/Res";
import { AdminGuard } from "../auth/admin.guard";

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
}