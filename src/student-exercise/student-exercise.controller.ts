import { Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { AdminGuard } from "../auth/admin.guard";
import { AuthGuard } from "../auth/auth.guard";

@Controller("student-exercise")
export class StudentExerciseController {

  @UseGuards(AuthGuard)
  @Post("send-exercise")
  @HttpCode(HttpStatus.OK)
  async sendExercise() {
    //todo send exercise
  }

  @UseGuards(AuthGuard)
  @Get("find-by-exercise")
  @HttpCode(HttpStatus.OK)
  async findByExercise() {
    //todo send findByExercise
  }

  @UseGuards(AdminGuard)
  @Post("give-score-by-student-exercise")
  @HttpCode(HttpStatus.OK)
  async checkExerciseByStudent() {
    //todo send checkExerciseByStudent
  }
}
