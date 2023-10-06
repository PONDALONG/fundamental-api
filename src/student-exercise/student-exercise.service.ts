import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { StudentExercise } from "./entities/student-exercise.entity";
import { DataSource, Repository } from "typeorm";
import { Exercise } from "../exercise/entities/exercise.entity";

@Injectable()
export class StudentExerciseService {
  constructor(
    @InjectRepository(StudentExercise)
    private readonly studentExerciseRepository: Repository<StudentExercise>,
    @InjectRepository(StudentExercise)
    private readonly repository: Repository<Exercise>,
    private dataSource: DataSource
  ) {
  }

  /*------------------- MAIN FUNCTION -------------------*/
  /*------------------- SUB FUNCTION -------------------*/

}
