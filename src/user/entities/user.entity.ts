import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "../dto/user-role.enum";
import { StudentCourse } from "../../student-course/entities/student-course.entity";
import { Exclude } from "class-transformer";

@Entity()
export class User {
  @PrimaryGeneratedColumn({ name: "user_id" })
  userId: number;

  @Column({ nullable: false, name: "firstname" })
  firstname: string;

  @Column({ nullable: false, name: "lastname" })
  lastname: string;

  @Column({ unique: true, nullable: true, name: "student_id" })
  studentId: string;

  @Column({ nullable: false, name: "role" })
  role: string = UserRole.STUDENT;

  @Exclude()
  @Column({ nullable: false, name: "password" })
  password: string;

  @Column({ nullable: true, name: "create_date" })
  createDate: Date = new Date();

  @Column({ nullable: true, name: "class" })
  class: string;

  //user 1-n student-course
  @OneToMany(() => StudentCourse, x => x.user)
  stdCourseId: StudentCourse[];
}
