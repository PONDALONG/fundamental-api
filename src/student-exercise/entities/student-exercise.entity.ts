import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Exercise } from "../../exercise/entities/exercise.entity";
import { StudentCourse } from "../../student-course/entities/student-course.entity";
import { FileResource } from "../../file-resource/entities/file-resource.entity";

@Entity({ name: "std_exercise" })
export class StudentExercise {
  @PrimaryGeneratedColumn({ name: "std_exec_id" })
  stdExecId: number;

  @Column({ name: "std_exec_result", type: "longtext" })
  stdExecResult: string;

  @Column({ name: "std_exec_status" })
  stdExecStatus: string;

  @Column({ name: "std_exec_date_time" })
  stdExecDateTime: Date = new Date();

  @Column({ name: "std_exec_score" })
  stdExecScore: number;

  //student-exercise n-1 exercise
  @ManyToOne(() => Exercise, x => x.stdExercises)
  @JoinColumn({ name: "exercise_id", referencedColumnName: "exerciseId" })
  exercise: Exercise;

  //student-exercise n-1 student-course
  @ManyToOne(() => StudentCourse, x => x.stdExercises)
  @JoinColumn({ name: "std_course_id", referencedColumnName: "stdCourseId" })
  studentCourse: StudentCourse;


  //student-exercise 1-n file-resource
  @OneToMany(() => FileResource, x => x.stdExercises)
  fileResources: FileResource[];
}
