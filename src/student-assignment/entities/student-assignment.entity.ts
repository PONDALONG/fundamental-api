import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Assignment } from "../../assignment/entities/assignment.entity";
import { Student } from "../../student/entities/student.entity";
import { FileResource } from "../../file-resource/entities/file-resource.entity";
import { stdAsmStatus } from "../dto/student-assignment.enum";

@Entity({ name: "student_assignment" })
export class StudentAssignment {
  @PrimaryGeneratedColumn({ name: "std_asm_id" })
  stdAsmId: number;

  @Column({ name: "std_asm_result", type: "longtext", nullable: true })
  stdAsmResult: string;

  @Column({ name: "std_asm_status", nullable: false, default: stdAsmStatus.WAIT })
  stdAsmStatus: stdAsmStatus;

  @Column({ name: "std_asm_group", nullable: true })
  stdAsmGroup: string;

  @Column({ name: "std_asm_date_time", nullable: false, type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  stdAsmDateTime: Date;

  @Column({ name: "std_asm_score", nullable: false, default: 0, type: "float" })
  stdAsmScore: number;

  //student-assignment n-1 assignment
  @ManyToOne(() => Assignment, x => x.studentAssignments, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "assignment_id", referencedColumnName: "assignmentId" })
  assignment: Assignment;

  //student-assignment n-1 student
  @ManyToOne(() => Student, x => x.studentAssignments, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "student_id", referencedColumnName: "studentId" })
  student: Student;


  //student-assignment 1-n file-resource
  @OneToMany(() => FileResource, x => x.studentAssignment, { nullable: true, onDelete: "CASCADE" })
  fileResources: FileResource[];
}
