import {
  BadRequestException,
  Body,
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
import { CreateAssignment, UpdateAssignment } from "./dto/assignment.model";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { AssignmentService } from "./assignment.service";
import { ResP } from "../utils/ResP";
import { AdminGuard } from "../auth/admin.guard";
import { AuthGuard } from "../auth/auth.guard";

@Controller("assignment")
export class AssignmentController {
  private readonly response = new ResP();

  constructor(
    private readonly service: AssignmentService
  ) {
  }

  @UseGuards(AdminGuard)
  @Post("create")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileFieldsInterceptor([
    { name: "files" }
  ]))
  async create(@UploadedFiles(
  ) files: Array<Express.Multer.File>, @Body() input: CreateAssignment) {
    return await this.service.create(files, input);
  }

  @UseGuards(AdminGuard)
  @Post("update")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileFieldsInterceptor([
    { name: "files" }
  ], {}))
  async update(@UploadedFiles() files: Array<Express.Multer.File>, @Body() input: UpdateAssignment) {
    await this.service.update(files, input);
    return this.response.ok();
  }

  @UseGuards(AdminGuard)
  @Get("find-all")
  @HttpCode(HttpStatus.OK)
  async findByRoom(
    @Query("roomYear") roomYear: number,
    @Query("roomGroup") roomGroup: string,
    @Query("roomTerm") roomTerm: number
  ) {

    try {

      if (isNaN(+roomYear)) throw new BadRequestException("roomYear ไม่ถูกต้อง");
      if (isNaN(+roomTerm)) throw new BadRequestException("roomTerm ไม่ถูกต้อง");

      return await this.service.findAll(roomYear, roomGroup, roomTerm);
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(AuthGuard)
  @Get("find")
  @HttpCode(HttpStatus.OK)
  async find(@Query("assignmentId") assignmentId: number) {
    try {
      if (isNaN(+assignmentId)) throw new BadRequestException("assignmentId ไม่ถูกต้อง");
      return await this.service.find(assignmentId);
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(AuthGuard)
  @Get("find-my-assignments")
  @HttpCode(HttpStatus.OK)
  async findMyAssignments(@Request() auth: any) {
    try {
      return await this.service.findMyAssignments(auth.user);
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(AdminGuard)
  @Delete("delete")
  @HttpCode(HttpStatus.OK)
  async delete(@Query("assignmentId") assignmentId: number) {
    try {
      if (isNaN(+assignmentId)) throw new BadRequestException("assignmentId ไม่ถูกต้อง");
      await this.service.delete(assignmentId);
      return this.response.ok();
    } catch (e) {
      throw e;
    }
  }

}