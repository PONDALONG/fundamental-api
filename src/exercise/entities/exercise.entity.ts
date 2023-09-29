import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "exercise" })
export class Exercise {

  @PrimaryGeneratedColumn({ name: "exercise_id" })
  exerciseId: number;

  @Column({ name: "course_id", nullable: false })
  courseId: number;

  @Column({ name: "exercise_name", nullable: false })
  exerciseName: string;

  @Column({ name: "exercise_description", nullable: false, type: "longtext" })
  exerciseDescription: string;

  @Column({ name: "exercise_score", nullable: false })
  exerciseScore: number;

  @Column({ name: "exercise_status", nullable: false })
  exerciseStatus: string;

  @Column({ name: "exercise_start_date", nullable: false })
  exerciseStartDate: Date;

  @Column({ name: "exercise_end_date", nullable: false })
  exerciseEndDate: Date;
}
