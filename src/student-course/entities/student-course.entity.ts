import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity({ name: "std_course" })
export class StudentCourse {

  @PrimaryGeneratedColumn({ name: "std_course_id" })
  id: number;

  @Column({ name: "student_id", nullable: false })
  studentId: number;

  @Column({ name: "user_id", nullable: false })
  userId: number;

  @Column({ name: "course_id", nullable: false })
  courseId: number;

  @Column({ name: "std_course_date" })
  stdCourseDate: Date = new Date();

  @Column({ name: "std_course_status" })
  stdCourseStatus: string;



}
