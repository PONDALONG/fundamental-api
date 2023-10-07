import {
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

@Controller("student-exercise")
@UseInterceptors(ClassSerializerInterceptor)
export class StudentExerciseController {

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
  @Post("give-score-by-student-exercise")
  @HttpCode(HttpStatus.OK)
  async checkExerciseByStudent() {
    //todo send checkExerciseByStudent
  }
}
