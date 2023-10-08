import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { AdminGuard } from "../auth/admin.guard";
import { AuthGuard } from "../auth/auth.guard";
import { StudentAssignmentService } from "./student-assignment.service";
import { Res } from "../utils/Res";
import { CheckStdAsm, FormIntoGroups } from "./dto/student-assignment.model";

@Controller("student-assignment")
@UseInterceptors(ClassSerializerInterceptor)
export class StudentAssignmentController {

  private readonly response = new Res();

  constructor(
    private readonly service: StudentAssignmentService
  ) {
  }

  @UseGuards(AuthGuard)
  @Post("send-assigment")
  @HttpCode(HttpStatus.OK)
  async sendAssignment() {
    //todo send assignment
  }

  @UseGuards(AuthGuard)
  @Get("find-all")
  @HttpCode(HttpStatus.OK)
  async findByAssignment(@Query("assignmentId") assignmentId: number) {
    return await this.service.findAll(assignmentId);
  }

  @UseGuards(AdminGuard)
  @Post("check-assigment")
  @HttpCode(HttpStatus.OK)
  async checkAssignment(@Body() input: CheckStdAsm) {
    await this.service.checkAssignment(input);
  }

  @UseGuards(AdminGuard)
  @Post("form-into-groups")
  @HttpCode(HttpStatus.OK)
  async formIntoGroups(@Body() input: FormIntoGroups) {
    await this.service.formIntoGroups(input);
    return this.response.ok();
  }
}
