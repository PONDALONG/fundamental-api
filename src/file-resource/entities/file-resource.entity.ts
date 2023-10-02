import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { FileResourceType } from "./file-resource-type.enum";
import { FileExercise } from "../../file-exercise/entities/file-exercise.entity";
import { StudentExercise } from "../../student-exercise/entities/student-exercise.entity";
import { Content } from "../../content/entities/content.entity";

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

  // file resource n - 1 content
  @ManyToOne(() => Content, x => x.fileResources, { nullable: true })
  @JoinColumn({ name: "content_id", referencedColumnName: "contentId" })
  content: Content;

  // file resource 1 - n file exercise
  @OneToMany(() => FileExercise, x => x.fileResource, { nullable: true })
  fileExercise: FileExercise;

}
