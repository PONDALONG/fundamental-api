import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { StudentExercise } from "./entities/student-exercise.entity";
import { DataSource, In, Repository } from "typeorm";
import { Exercise } from "../exercise/entities/exercise.entity";
import { SendExerciseRequest } from "./dto/send-exercise-request";
import { StudentRoom } from "../student-room/entities/student-room.entity";
import { FormIntoGroups } from "./dto/form-into-groups-request";
import { CheckStdExercise } from "./dto/check-std-exercise-request";
import { ExerciseType } from "../exercise/dto/exercise.enum";

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

  async findAll(exerciseId: number): Promise<StudentExercise[]> {
    return await this.repository.createQueryBuilder("stdExec")
      .innerJoin("stdExec.exercise", "exercise")
      .innerJoin("stdExec.studentRoom", "stdRoom")
      .innerJoin("stdRoom.user", "user")
      .select(["stdExec", "stdRoom", "user"])
      .where("exercise.exerciseId = :exerciseId", { exerciseId: exerciseId })
      .getMany();
  }

  async formIntoGroups(input: FormIntoGroups) {
    const existExec = await this.exerciseRepository.exist({
      where: {
        exerciseId: input.exerciseId
      }
    });
    if (!existExec) {
      throw new BadRequestException("ไม่พบข้อมูล แบบฝึกหัด");
    }

    const stdExecs = await this.repository.find({
      where: {
        stdExecId: In(input.stdExecIds)
      }
    });

    for (const stdExec of stdExecs) {
      stdExec.stdExecGroup = input.stdExecGroup;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(stdExecs);
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(e);
    } finally {
      await queryRunner.release();
    }

  }


  async checkExercise(input: CheckStdExercise) {
    const stdExec = await this.repository.createQueryBuilder("stdExec")
      .innerJoin("stdExec.exercise", "exercise")
      .select(["stdExec", "exercise"])
      .where("stdExec.stdExecId = :stdExecId", { stdExecId: input.stdExecId })
      .andWhere("exercise.exerciseId = :exerciseId", { exerciseId: input.exerciseId })
      .getOne();

    if (!stdExec) {
      throw new BadRequestException("ไม่พบข้อมูล แบบฝึกหัด");
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    if (stdExec.exercise.exerciseType === ExerciseType.INDIVIDUAL) {

      stdExec.stdExecScore = input.stdExecScore;
      await queryRunner.manager.save(stdExec);
    } else {
      // give score to group
      const stdExecs = await this.repository.find({
        where: {
          stdExecGroup: stdExec.stdExecGroup,
          exercise: stdExec.exercise
        }
      });

      const query = "UPDATE std_exercise SET std_exec_score = ? WHERE std_exec_group = ? and exercise_id = ?";

      try {
        await this.repository.query(query, [input.stdExecScore, stdExec.stdExecGroup, stdExec.exercise.exerciseId]);
      } catch (error) {
        throw new Error(`Error updating rows: ${error.message}`);
      }
    }


  }


  /*------------------- SUB FUNCTION -------------------*/

  private validateSendExerciseInput(input: SendExerciseRequest) {

  }


}
