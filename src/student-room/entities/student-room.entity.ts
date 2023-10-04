import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Room } from "../../room/entities/room.entity";
import { User } from "../../user/entities/user.entity";
import { StdRoomStatus } from "./std-room-status.enum";
import { StudentExercise } from "../../student-exercise/entities/student-exercise.entity";

@Entity({ name: "std_room" })
export class StudentRoom {

  @PrimaryGeneratedColumn({ name: "std_room_id" })
  stdRoomId: number;

  @Column({ name: "std_room_date", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  stdRoomDate: Date;

  @Column({ name: "std_room_status", nullable: false, default: StdRoomStatus.ACTIVE })
  stdRoomStatus: string;

  //student-room n-1 room
  @ManyToOne(() => Room, x => x.studentRooms)
  @JoinColumn({ name: "room_id", referencedColumnName: "roomId" })
  room: Room;

  //student-room 1-n student-exercise
  @OneToMany(() => StudentExercise, x => x.studentRoom)
  stdExercises: StudentExercise[];

  //student-room n-1 user
  @ManyToOne(() => User, x => x.stdRoomId,{nullable: false})
  @JoinColumn({ name: "user_id", referencedColumnName: "userId" })
  user: User;

}
