import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Course } from "../../course/entities/course.entity";
import { User } from "../../user/entities/user.entity";
import { StdCourseStatus } from "./stdCourseStatus";

@Entity({ name: "std_course" })
export class StudentCourse {

  @PrimaryGeneratedColumn({ name: "std_course_id" })
  stdCourseId: number;

  @Column({ name: "std_course_date", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  stdCourseDate: Date;

  @Column({ name: "std_course_status", nullable: false, default: StdCourseStatus.ACTIVE })
  stdCourseStatus: string;

  //student-course n-1 course
  @ManyToOne(() => Course, x => x.studentCourse)
  @JoinColumn({ name: "course_id", referencedColumnName: "courseId" })
  course: Course;

  //student-course 1-n student-exercise
  @OneToMany(() => StudentCourse, x => x.stdCourseId)
  stdExercises: StudentCourse[];

  //student-course n-1 user
  @ManyToOne(() => User, x => x.stdCourseId)
  @JoinColumn({ name: "user_id", referencedColumnName: "userId" })
  user: User;

}
