import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "std_exercise" })
export class StudentExercise {
  @PrimaryGeneratedColumn({ name: "std_exec_id" })
  stdExecId: number;

  @Column({ name: "exercise_id" })
  exerciseId: number;

  @Column({ name: "std_course_id" })
  stdCourseId: number;

  @Column({ name: "std_exec_result", type: "longtext" })
  stdExecResult: string;

  @Column({ name: "std_exec_status" })
  stdExecStatus: string;

  @Column({ name: "std_exec_date_time" })
  stdExecDateTime: Date = new Date();

  @Column({ name: "std_exec_score" })
  stdExecScore: number;
}
