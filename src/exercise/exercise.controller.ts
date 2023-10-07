import {
  BadRequestException,
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
import { CreateExerciseRequest } from "./dto/create-exercise-request";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { ExerciseService } from "./exercise.service";
import { Res } from "../utils/Res";
import { UpdateExerciseRequest } from "./dto/update-exercise-request";

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
  ) files: Array<Express.Multer.File>, @Body() input: CreateExerciseRequest) {
    await this.service.create(files, input);
    return this.response.ok();
  }

  @Post("update")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileFieldsInterceptor([
    { name: "files" }
  ]))
  async update(@UploadedFiles() files: Array<Express.Multer.File>, @Body() input: UpdateExerciseRequest) {
    await this.service.update(files, input);
    return this.response.ok();
  }

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

}