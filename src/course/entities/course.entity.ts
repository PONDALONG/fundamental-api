import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { CourseStatus } from "../dto/course-status.enum";

@Entity({ name: "course" })
export class Course {

  @PrimaryGeneratedColumn({ name: "course_id" })
  courseId: number;

  @Column({ name: "course_name", nullable: false}) //unique
  courseName: string;

  @Column({ name: "course_year", nullable: false }) //unique
  courseYear: number;

  @Column({ name: "course_group", nullable: false }) //unique
  courseGroup: string;

  @Column({ name: "course_term", nullable: false }) //unique
  courseTerm: number;

  @Column({ name: "course_description", nullable: false, type: "longtext" })
  courseDescription: string;

  @Column({ name: "course_status", nullable: false })
  courseStatus: string = CourseStatus.OPEN;

  @Column({ name: "course_start_date", nullable: false })
  courseStartDate: Date = new Date();

  @Column({ name: "course_create_date", nullable: false })
  courseCreateDate: Date = new Date();



}
