import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { StudentRoomService } from "./student-room.service";
import { AuthGuard } from "../auth/auth.guard";
import { User } from "../user/entities/user.entity";
import { AdminGuard } from "../auth/admin.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { RoomCreateRequestDto } from "../room/dto/room-create-request.dto";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("student-course")
export class StudentRoomController {
  constructor(
    private readonly service: StudentRoomService
  ) {
  }

  @UseGuards(AuthGuard)
  @Get("findAllStdCourse")
  @HttpCode(HttpStatus.OK)
  async findAllStdCourse(@Request() auth: any) {
    try {
      return await this.service.findAllByUser(auth["user"] as User);
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(AdminGuard)
  @Get("find-all")
  @HttpCode(HttpStatus.OK)
  async findAll() {
    try {
      return await this.service.findAll();
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(AdminGuard)
  @Post("import-student")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor("file"))
  async importStudent(@UploadedFile() file: Express.Multer.File, @Body() body: RoomCreateRequestDto) {
    try {
      return await this.service.importStudent(file, body.roomId);
    } catch (e) {
      throw e;
    }
  }

  // @UseGuards(AdminGuard)
  // @Post("update-student-room")
  // @HttpCode(HttpStatus.OK)
  // async updateStudentRoom(@Body() body: RoomCreateRequestDto) {
  //   try {
  //     return await this.service.updateStudentRoom(body);
  //   } catch (e) {
  //     throw e;
  //   }
  // }
}
