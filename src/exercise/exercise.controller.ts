import {
  Body,
  Controller, FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus, MaxFileSizeValidator, ParseFilePipe,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors
} from "@nestjs/common";
import { CreateExercise } from "./dto/create-exercise";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { createWriteStream } from "fs";
import { Constant } from "../utils/constant";
import { AppUtils } from "../utils/app.utils";

@Controller("exercise")
export class ExerciseController {

  @Post("create")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileFieldsInterceptor([
    { name: "files" }
  ]))
  async create(@UploadedFiles(
  ) files: Array<Express.Multer.File>, @Body() input: CreateExercise) {
    //todo create

  }

  @Get("find-by-room")
  @HttpCode(HttpStatus.OK)
  async findByRoom(@Query("roomId") roomId: number) {
    return roomId;
    //todo find by room
  }

  @Post("update")
  @HttpCode(HttpStatus.OK)
  async update() {
    //todo update
  }

}