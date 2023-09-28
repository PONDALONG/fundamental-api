import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "../dto/user-role.enum";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid", { name: "user_id" })
  userId: number;

  @Column({ nullable: false, name: "firstname" })
  firstname: string;

  @Column({ nullable: false, name: "lastname" })
  lastname: string;

  @Column({ unique: true, nullable: true, name: "student_id" })
  studentId: string;

  @Column({ nullable: false, name: "role" })
  role: string = UserRole.STUDENT;

  @Column({ nullable: false, name: "password" })
  password: string;

  @Column({ nullable: true, name: "create_date" })
  createDate: Date = new Date();
}
