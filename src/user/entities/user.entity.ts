import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "../dto/user-role.enum";
import { Exclude } from "class-transformer";
import { StudentRoom } from "../../student-room/entities/student-room.entity";
import { UserStatus } from "../dto/user-status.enum";

@Entity()
export class User {
  @PrimaryGeneratedColumn({ name: "user_id" })
  userId: number;

  @Column({ nullable: false, name: "firstname" })
  firstname: string;

  @Column({ nullable: false, name: "lastname" })
  lastname: string;

  @Column({ unique: true, nullable: false, name: "student_code" })
  studentCode: string;

  @Column({ nullable: false, name: "role", default: UserRole.STUDENT })
  role: string;

  @Column({ nullable: true, name: "user_status" ,default: UserStatus.ACTIVE})
  userStatus: UserStatus;

  @Exclude()
  @Column({ nullable: false, name: "password" })
  password: string;

  @Column({ nullable: true, name: "create_date", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createDate: Date;

  @Column({ nullable: true, name: "class" })
  class: string;

  @Column({ nullable: true, name: "profile" })
  image: string;

  //user 1-n student-course
  @OneToMany(() => StudentRoom, x => x.user)
  stdCourseId: StudentRoom[];

}
