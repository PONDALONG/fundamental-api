import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Room } from "../../room/entities/room.entity";
import { User } from "../../user/entities/user.entity";
import { StudentExercise } from "../../student-exercise/entities/student-exercise.entity";
import { StudentStatus } from "../dto/student.enum";

@Entity({ name: "student" })
export class Student {

  @PrimaryGeneratedColumn({ name: "student_id" })
  studentId: number;

  @Column({ name: "student_date", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  studentDate: Date;

  @Column({ name: "student_status", nullable: false, default: StudentStatus.ACTIVE })
  studentStatus: string;

  //student n-1 room
  @ManyToOne(() => Room, x => x.studentRooms)
  @JoinColumn({ name: "room_id", referencedColumnName: "roomId" })
  room: Room;

  //student 1-n student-exercise
  @OneToMany(() => StudentExercise, x => x.student, { onDelete: "CASCADE" })
  stdExercises: StudentExercise[];

  //student 1-1 user
  @ManyToOne(() => User, x => x.student, { nullable: false })
  @JoinColumn({ name: "user_id", referencedColumnName: "userId" })
  user: User;

}
