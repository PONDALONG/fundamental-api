import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Exclude } from "class-transformer";
import { Student } from "../../student/entities/student.entity";
import { UserRole, UserStatus } from "../dto/user.enum";

@Entity()
export class User {
  @PrimaryGeneratedColumn({ name: "user_id" })
  userId: number;

  @Column({ nullable: false, name: "firstname" })
  firstname: string;

  @Column({ nullable: false, name: "lastname" })
  lastname: string;

  @Column({ unique: true, nullable: false, name: "student_code", length: 20 })
  studentCode: string;

  @Column({ nullable: false, name: "role", default: UserRole.STUDENT })
  role: string;

  @Column({ nullable: true, name: "user_status", default: UserStatus.ACTIVE })
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

  //user 1-1 student
  @OneToOne(() => Student, x => x.user)
  student: Student;

}
