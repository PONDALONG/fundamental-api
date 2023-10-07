import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { StudentExercise } from "./entities/student-exercise.entity";
import { DataSource, Repository } from "typeorm";
import { Exercise } from "../exercise/entities/exercise.entity";
import { SendExerciseRequest } from "./dto/send-exercise-request";
import { StudentRoom } from "../student-room/entities/student-room.entity";

@Injectable()
export class StudentExerciseService {
  constructor(
    @InjectRepository(StudentExercise)
    private readonly repository: Repository<StudentExercise>,
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
    private dataSource: DataSource
  ) {
  }

  /*------------------- MAIN FUNCTION -------------------*/

  autoGenerate(exercise: Exercise, studentRoom: StudentRoom[]): StudentExercise[] {
    const studentExercise: StudentExercise[] = Array<StudentExercise>();

    for (const studentRoomElement of studentRoom) {
      const save = new StudentExercise();
      save.exercise = exercise;
      save.studentRoom = studentRoomElement;
      studentExercise.push(save);
    }

    return studentExercise;
  }


  /*------------------- SUB FUNCTION -------------------*/

  private validateSendExerciseInput(input: SendExerciseRequest) {

  }


}
