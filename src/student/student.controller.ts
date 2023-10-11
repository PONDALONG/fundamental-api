import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { StudentService } from "./student.service";
import { AdminGuard } from "../auth/admin.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { RoomCreate } from "../room/dto/room.model";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("student")
export class StudentController {
  constructor(
    private readonly service: StudentService
  ) {
  }

  // @UseGuards(AdminGuard)
  @Get("find-all")
  @HttpCode(HttpStatus.OK)
  async findAll(
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

  @UseGuards(AdminGuard)
  @Post("import")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor("file"))
  async import(@UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 1000 * 1000 * 5 }),
        new FileTypeValidator({ fileType: "csv" })
      ]
    })
  ) file: Express.Multer.File, @Body() body: any) {
    try {
      return await this.service.import(file, body.roomId);
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(AdminGuard)
  @Post("update")
  @HttpCode(HttpStatus.OK)
  async update(@Body() body: RoomCreate) {
    //todo: update
  }
}
