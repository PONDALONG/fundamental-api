import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { FileResourceType } from "./file-resource-type.enum";
import { StudentAssignment } from "../../student-assignment/entities/student-assignment.entity";
import { Assignment } from "../../assignment/entities/assignment.entity";

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

  // file resource n - 1 student assignment
  @ManyToOne(() => StudentAssignment, x => x.fileResources, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "std_asm_id", referencedColumnName: "stdAsmId" })
  studentAssignment: StudentAssignment;

  @ManyToOne(() => Assignment, x => x.fileResources, { nullable: true })
  @JoinColumn({ name: "assignment_id", referencedColumnName: "assignmentId" })
  assignment: Assignment;
}
