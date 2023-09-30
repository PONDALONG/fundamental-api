import { User } from "./user/entities/user.entity";
import { StudentExercise } from "./student-exercise/entities/student-exercise.entity";
import { Course } from "./course/entities/course.entity";
import { Exercise } from "./exercise/entities/exercise.entity";
import { StudentCourse } from "./student-course/entities/student-course.entity";

export const BaseEntity = [User, StudentCourse, Exercise, Course, StudentExercise];
