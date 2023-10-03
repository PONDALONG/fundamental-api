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

  @Column({ unique: true, nullable: false, name: "student_code" })
  studentCode: string;

  @Column({ nullable: false, name: "role", default: UserRole.STUDENT })
  role: string;

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
  @OneToMany(() => StudentCourse, x => x.user)
  stdCourseId: StudentCourse[];

}
