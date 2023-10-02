import { Injectable } from "@nestjs/common";
import { StudentCourseService } from "../student-course/student-course.service";
import { InjectRepository } from "@nestjs/typeorm";
import { StudentExercise } from "./entities/student-exercise.entity";
import { Repository } from "typeorm";

@Injectable()
export class StudentExerciseService {
  constructor(
    @InjectRepository(StudentExercise)
    private readonly repository: Repository<StudentExercise>,
    private readonly stdCourseService: StudentCourseService
  ) {
  }
}
