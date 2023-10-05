import {
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
import { StudentRoomService } from "./student-room.service";
import { AdminGuard } from "../auth/admin.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { RoomCreateRequestDto } from "../room/dto/room-create-request.dto";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("student-room")
export class StudentRoomController {
  constructor(
    private readonly service: StudentRoomService
  ) {
  }

  // @UseGuards(AdminGuard)
  @Get("find-all")
  @HttpCode(HttpStatus.OK)
  async findAll(@Query("roomId") roomId?: number) {
    //todo: find all
    //todo : find all by room
    return roomId;
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
  ) file: Express.Multer.File, @Body() body: RoomCreateRequestDto) {
    try {
      return await this.service.import(file, body.roomId);
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(AdminGuard)
  @Post("update")
  @HttpCode(HttpStatus.OK)
  async update(@Body() body: RoomCreateRequestDto) {
    //todo: update
  }
}
