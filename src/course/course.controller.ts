import { Body, Controller, HttpCode, HttpException, HttpStatus, Post } from "@nestjs/common";
import { CourseCreateRequestDto } from "./dto/course-create-request.dto";
import { CourseService } from "./course.service";
import { Res } from "../ีutils/Res";

@Controller("course")
export class CourseController {

  private readonly response = new Res();
  constructor(
    private readonly service: CourseService
  ) {
  }

  @Post("create")
  @HttpCode(HttpStatus.OK)
  async create(@Body() input: CourseCreateRequestDto) {

    try {
      await this.service.create(input);
      return this.response.ok();
    } catch (error) {
      throw error;
    }
    finally {
    }
  }
}