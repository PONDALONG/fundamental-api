import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Exercise } from "../../exercise/entities/exercise.entity";
import { FileResource } from "../../file-resource/entities/file-resource.entity";

@Entity({ name: "file_exercise" })
export class FileExercise {

  @PrimaryGeneratedColumn({ name: "file_exercise_id" })
  fileExerciseId: number;

  // file exercise n - 1 exercise
  @ManyToOne(() => Exercise, x => x.fileExercise)
  @JoinColumn({ name: "exercise_id", referencedColumnName: "exerciseId" })
  exercise: Exercise[];

  // file exercise n - 1 file resource
  @ManyToOne(() => FileResource, x => x.fileExercise)
  @JoinColumn({ name: "file_resource_id", referencedColumnName: "fileResourceId" })
  fileResource: FileResource;

}
