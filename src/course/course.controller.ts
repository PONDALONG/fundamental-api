import { Body, Controller, HttpCode, HttpStatus, Post, Request, UseGuards } from "@nestjs/common";
import { CourseCreateRequestDto } from "./dto/course-create-request.dto";
import { CourseService } from "./course.service";
import { Res } from "../ีutils/Res";
import { MyLogger } from "../ีutils/MyLogger";
import { User } from "../user/entities/user.entity";
import { AdminGuard } from "../auth/admin.guard";

@Controller("course")
export class CourseController {
  private readonly logger = new MyLogger(CourseController.name);
  private readonly response = new Res();
  private readonly transaction: string = new Date().getTime().toString();

  constructor(
    private readonly service: CourseService
  ) {
  }

  @UseGuards(AdminGuard)
  @Post("create")
  @HttpCode(HttpStatus.OK)
  async create(@Body() input: CourseCreateRequestDto, @Request() auth: any) {

    const user: User = auth.user as User;
    this.logger.logStart(this.transaction, this.create.name, user.studentId, user.role);
    this.logger.logInfo(this.transaction, user.studentId, user.role, input);

    try {

      await this.service.create(input);

      return this.response.ok();

    } catch (e) {
      throw e;

    } finally {

      this.logger.logEnd(this.transaction, this.create.name, user.studentId, user.role);

    }
  }
}