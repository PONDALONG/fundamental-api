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
import { StudentExerciseService } from "./student-exercise.service";
import { FormIntoGroups } from "./dto/form-into-groups-request";
import { CheckStdExercise } from "./dto/check-std-exercise-request";
import { Res } from "../utils/Res";

@Controller("student-exercise")
@UseInterceptors(ClassSerializerInterceptor)
export class StudentExerciseController {

  private readonly response = new Res();

  constructor(
    private readonly service: StudentExerciseService
  ) {
  }

  @UseGuards(AuthGuard)
  @Post("send-exercise")
  @HttpCode(HttpStatus.OK)
  async sendExercise() {
    //todo send exercise
  }

  @UseGuards(AuthGuard)
  @Get("find-all")
  @HttpCode(HttpStatus.OK)
  async findByExercise(@Query("exerciseId") exerciseId: number) {
    return await this.service.findAll(exerciseId);
  }

  @UseGuards(AdminGuard)
  @Post("check-exercise")
  @HttpCode(HttpStatus.OK)
  async checkExercise(@Body() input: CheckStdExercise) {
    await this.service.checkExercise(input);
  }

  @UseGuards(AdminGuard)
  @Post("form-into-groups")
  @HttpCode(HttpStatus.OK)
  async formIntoGroups(@Body() input: FormIntoGroups) {
    await this.service.formIntoGroups(input);
    return this.response.ok();
  }
}
