import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Room } from "../../room/entities/room.entity";
import { User } from "../../user/entities/user.entity";
import { StdRoomStatus } from "./std-room-status.enum";

@Entity({ name: "std_room" })
export class StudentRoom {

  @PrimaryGeneratedColumn({ name: "std_room_id" })
  stdCourseId: number;

  @Column({ name: "std_room_date", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  stdCourseDate: Date;

  @Column({ name: "std_room_status", nullable: false, default: StdRoomStatus.ACTIVE })
  stdCourseStatus: string;

  //student-room n-1 room
  @ManyToOne(() => Room, x => x.studentRooms)
  @JoinColumn({ name: "room_id", referencedColumnName: "roomId" })
  room: Room;

  //student-room 1-n student-exercise
  @OneToMany(() => StudentRoom, x => x.stdCourseId)
  stdExercises: StudentRoom[];

  //student-room n-1 user
  @ManyToOne(() => User, x => x.stdCourseId)
  @JoinColumn({ name: "user_id", referencedColumnName: "userId" })
  user: User;

}
