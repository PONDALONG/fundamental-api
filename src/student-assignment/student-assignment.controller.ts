import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { AdminGuard } from "../auth/admin.guard";
import { AuthGuard } from "../auth/auth.guard";
import { StudentAssignmentService } from "./student-assignment.service";
import { ResP } from "../utils/ResP";
import { CheckStdAsm, FormIntoGroups, SendAssignment } from "./dto/student-assignment.model";
import { FileFieldsInterceptor } from "@nestjs/platform-express";

@Controller("student-assignment")
@UseInterceptors(ClassSerializerInterceptor)
export class StudentAssignmentController {

  private readonly response = new ResP();

  constructor(
    private readonly service: StudentAssignmentService
  ) {
  }

  @UseGuards(AuthGuard)
  @Post("send-assigment")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileFieldsInterceptor([
    { name: "files" }
  ]))
  async sendAssignment(@Body() input: SendAssignment, @UploadedFiles() files: Array<Express.Multer.File>, @Request() auth: any) {
    await this.service.sendAssignment(input, files, auth.user);
    return this.response.ok();
  }

  @UseGuards(AuthGuard)
  @Delete("cancel-send-assigment")
  @HttpCode(HttpStatus.OK)
  async cancelSendAssignment(@Query("stdAsmId") stdAsmId: number, @Request() auth: any) {
    await this.service.cancelSendAssignment(auth.user, stdAsmId);
    return this.response.ok();
  }

  @UseGuards(AuthGuard)
  @Get("my-assignment")
  @HttpCode(HttpStatus.OK)
  async myAssignment(@Request() auth: any, @Query("assignmentId") assignmentId: number) {
    return await this.service.findOne(auth.user, assignmentId);
  }

  @UseGuards(AuthGuard)
  @Get("find-all")
  @HttpCode(HttpStatus.OK)
  async findByAssignment(@Query("assignmentId") assignmentId: number) {
    return await this.service.findAll(assignmentId);
  }

  @UseGuards(AdminGuard)
  @Post("check-assignment")
  @HttpCode(HttpStatus.OK)
  async checkAssignment(@Body() input: CheckStdAsm) {
    await this.service.checkAssignment(input);
    return this.response.ok();
  }

  @UseGuards(AdminGuard)
  @Post("form-into-groups")
  @HttpCode(HttpStatus.OK)
  async formIntoGroups(@Body() input: FormIntoGroups[]) {
    await this.service.formIntoGroups(input);
    return this.response.ok();
  }

  @UseGuards(AuthGuard)
  @Post("update-my-assignments")
  @HttpCode(HttpStatus.OK)
  async updateMyAssignments(@Request() auth: any) {
    await this.service.updateMyAssignments(auth.user);
    return this.response.ok();
  }

  @UseGuards(AdminGuard)
  @Get("find-student")
  @HttpCode(HttpStatus.OK)
  async findStudent(@Query("assignmentId") assignmentId: number) {
    return await this.service.findStudent(assignmentId);
  }

  @UseGuards(AdminGuard)
  @Get("find")
  @HttpCode(HttpStatus.OK)
  async find(@Query("stdAsmId") stdAsmId: number) {
    return await this.service.find(stdAsmId);
  }

}
