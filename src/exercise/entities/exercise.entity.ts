import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { StudentExercise } from "../../student-exercise/entities/student-exercise.entity";
import { Room } from "../../room/entities/room.entity";
import { FileResource } from "../../file-resource/entities/file-resource.entity";
import { ExerciseStatus, ExerciseType } from "../dto/exercise.enum";

@Entity({ name: "exercise" })
export class Exercise {

  @PrimaryGeneratedColumn({ name: "exercise_id" })
  exerciseId: number;

  @Column({ name: "exercise_name", nullable: false })
  exerciseName: string;

  @Column({ name: "exercise_description", nullable: false, type: "longtext" })
  exerciseDescription: string;

  @Column({ name: "exercise_score", nullable: false })
  exerciseScore: number;

  @Column({ name: "exercise_status", nullable: false, default: ExerciseStatus.CLOSE })
  exerciseStatus: string;

  @Column({ name: "exercise_type", nullable: false })
  exerciseType: ExerciseType;

  @Column({ name: "exercise_start_date", nullable: false, type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  exerciseStartDate: Date;

  @Column({ name: "exercise_end_date", nullable: true })
  exerciseEndDate: Date;

  //exercise 1-n student-exercise
  @OneToMany(() => StudentExercise, x => x.exercise, { onDelete: "CASCADE" })
  stdExercises: StudentExercise[];

  //exercise n-1 room
  @ManyToOne(() => Room, x => x.exercises)
  @JoinColumn({ name: "room_id", referencedColumnName: "roomId" })
  room: Room;

  @OneToMany(() => FileResource, x => x.exercise)
  fileResources: FileResource[];
}
