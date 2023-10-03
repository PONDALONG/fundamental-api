import { Injectable } from "@nestjs/common";
import { StudentRoomService } from "../student-room/student-room.service";
import { InjectRepository } from "@nestjs/typeorm";
import { StudentExercise } from "./entities/student-exercise.entity";
import { Repository } from "typeorm";

@Injectable()
export class StudentExerciseService {
  constructor(
    @InjectRepository(StudentExercise)
    private readonly repository: Repository<StudentExercise>,
    private readonly stdCourseService: StudentRoomService
  ) {
  }
}
