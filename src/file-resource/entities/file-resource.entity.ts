import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { FileResourceType } from "./file-resource-type.enum";
import { StudentExercise } from "../../student-exercise/entities/student-exercise.entity";
import { Exercise } from "../../exercise/entities/exercise.entity";

@Entity({ name: "file_resource" })
export class FileResource {

  @PrimaryGeneratedColumn({ name: "file_resource_id" })
  fileResourceId: number;

  @Column({ name: "file_resource_name", nullable: false })
  fileResourceName: string;

  @Column({ name: "file_resource_path", nullable: false })
  fileResourcePath: string;

  @Column({ name: "file_resource_type", nullable: false })
  fileResourceType: FileResourceType;

  // file resource n - 1 student exercise
  @ManyToOne(() => StudentExercise, x => x.fileResources, { nullable: true })
  @JoinColumn({ name: "std_exec_id", referencedColumnName: "stdExecId" })
  stdExercises: StudentExercise;

  @ManyToOne(() => Exercise, x => x.fileResources, { nullable: true })
  @JoinColumn({ name: "exercise_id", referencedColumnName: "exerciseId" })
  exercise: Exercise;
}
