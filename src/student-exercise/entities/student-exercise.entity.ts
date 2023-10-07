import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Exercise } from "../../exercise/entities/exercise.entity";
import { StudentRoom } from "../../student-room/entities/student-room.entity";
import { FileResource } from "../../file-resource/entities/file-resource.entity";
import { StdExecStatus } from "../dto/std-exec.enum";

@Entity({ name: "std_exercise" })
export class StudentExercise {
  @PrimaryGeneratedColumn({ name: "std_exec_id" })
  stdExecId: number;

  @Column({ name: "std_exec_result", type: "longtext", nullable: true })
  stdExecResult: string;

  @Column({ name: "std_exec_status", nullable: false, default: StdExecStatus.WAIT })
  stdExecStatus: StdExecStatus;

  @Column({ name: "std_exec_type", nullable: true })
  stdExecGroup: string;

  @Column({ name: "std_exec_date_time", nullable: false, type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  stdExecDateTime: Date;

  @Column({ name: "std_exec_score", nullable: false, default: 0, type: "float" })
  stdExecScore: number;

  //student-exercise n-1 exercise
  @ManyToOne(() => Exercise, x => x.stdExercises, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "exercise_id", referencedColumnName: "exerciseId" })
  exercise: Exercise;

  //student-exercise n-1 student-room
  @ManyToOne(() => StudentRoom, x => x.stdExercises, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "std_room_id", referencedColumnName: "stdRoomId" })
  studentRoom: StudentRoom;


  //student-exercise 1-n file-resource
  @OneToMany(() => FileResource, x => x.stdExercises, { nullable: true, onDelete: "CASCADE" })
  fileResources: FileResource[];
}
