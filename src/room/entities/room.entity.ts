import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RoomStatus } from "../dto/room-status.enum";
import { Exercise } from "../../exercise/entities/exercise.entity";
import { StudentRoom } from "../../student-room/entities/student-room.entity";

@Entity({ name: "room" })
export class Room {

  @PrimaryGeneratedColumn({ name: "room_id" })
  roomId: number;

  @Column({ name: "room_name", nullable: false }) //unique
  roomName: string;

  @Column({ name: "room_year", nullable: false }) //unique
  roomYear: number;

  @Column({ name: "room_group", nullable: false }) //unique
  roomGroup: string;

  @Column({ name: "room_term", nullable: false }) //unique
  roomTerm: number;

  @Column({ name: "room_code", nullable: false })
  roomCode: string;

  @Column({ name: "room_description", nullable: true, type: "longtext" })
  roomDescription: string;

  @Column({ name: "room_status", nullable: false, default: RoomStatus.CLOSED })
  roomStatus: string;

  @Column({ name: "room_start_date", nullable: true })
  roomStartDate: Date;

  @Column({ name: "room_end_date", nullable: true })
  roomEndDate: Date;

  @Column({ name: "room_create_date", nullable: false, type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  roomCreateDate: Date;

  //room 1-n exercise
  @OneToMany(() => Exercise, x => x.room)
  exercises: Exercise[];

  //room 1-n student-room
  @OneToMany(() => StudentRoom, x => x.room)
  studentRooms: StudentRoom[];

}