import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CourseStatus } from "../dto/course-status.enum";
import { Exercise } from "../../exercise/entities/exercise.entity";
import { StudentCourse } from "../../student-course/entities/student-course.entity";

@Entity({ name: "course" })
export class Course {

  @PrimaryGeneratedColumn({ name: "course_id" })
  courseId: number;

  @Column({ name: "course_name", nullable: false }) //unique
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

  //course 1-n exercise
  @OneToMany(() => Exercise, x => x.course)
  exercises: Exercise[];

  //course 1-n student-course
  @OneToMany(() => StudentCourse, x => x.course)
  studentCourse: StudentCourse[];

}