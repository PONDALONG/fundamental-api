import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Room } from "../../room/entities/room.entity";
import { FileResource } from "../../file-resource/entities/file-resource.entity";
import { AssignmentStatus, AssignmentType } from "../dto/assignment.enum";
import { StudentAssignment } from "../../student-assignment/entities/student-assignment.entity";

@Entity({ name: "assignment" })
export class Assignment {

  @PrimaryGeneratedColumn({ name: "assignment_id" })
  assignmentId: number;

  @Column({ name: "assignment_name", nullable: false })
  assignmentName: string;

  @Column({ name: "assignment_description", nullable: false, type: "longtext" })
  assignmentDescription: string;

  @Column({ name: "assignment_score", nullable: false })
  assignmentScore: number;

  @Column({ name: "assignment_status", nullable: false, default: AssignmentStatus.CLOSE })
  assignmentStatus: string;

  @Column({ name: "assignment_type", nullable: false })
  assignmentType: AssignmentType;

  @Column({ name: "assignment_start_date", nullable: false, type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  assignmentStartDate: Date;

  @Column({ name: "assignment_end_date", nullable: true })
  assignmentEndDate: Date;

  //assignment 1-n student-assignment
  @OneToMany(() => StudentAssignment, x => x.assignment, { onDelete: "CASCADE" })
  studentAssignments: StudentAssignment[];

  //assignment n-1 room
  @ManyToOne(() => Room, x => x.assignments)
  @JoinColumn({ name: "room_id", referencedColumnName: "roomId" })
  room: Room;

  @OneToMany(() => FileResource, x => x.assignment)
  fileResources: FileResource[];
}
