import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors
} from "@nestjs/common";
import { CreateExercise } from "./dto/create-exercise";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { ExerciseService } from "./exercise.service";
import { Res } from "../utils/Res";

@Controller("exercise")
export class ExerciseController {
  private readonly response = new Res();
  constructor(
    private readonly service: ExerciseService
  ) {
  }

  @Post("create")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileFieldsInterceptor([
    { name: "files" }
  ]))
  async create(@UploadedFiles(
  ) files: Array<Express.Multer.File>, @Body() input: CreateExercise) {
    await this.service.create(files, input);

    return this.response.ok()
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