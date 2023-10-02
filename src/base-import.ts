import { User } from "./user/entities/user.entity";
import { StudentExercise } from "./student-exercise/entities/student-exercise.entity";
import { Course } from "./course/entities/course.entity";
import { Exercise } from "./exercise/entities/exercise.entity";
import { StudentCourse } from "./student-course/entities/student-course.entity";
import { UserController } from "./user/user.controller";
import { CourseController } from "./course/course.controller";
import { StudentCourseController } from "./student-course/student-course.controller";
import { ExerciseController } from "./exercise/exercise.controller";
import { StudentExerciseController } from "./student-exercise/student-exercise.controller";
import { UserService } from "./user/user.service";
import { CourseService } from "./course/course.service";
import { StudentCourseService } from "./student-course/student-course.service";
import { ExerciseService } from "./exercise/exercise.service";
import { StudentExerciseService } from "./student-exercise/student-exercise.service";
import { AuthService } from "./auth/auth.service";

export const BaseImport = [];

export const ImportEntities = [
  User,
  Course,
  StudentCourse,
  Exercise,
  StudentExercise
];
export const ImportControllers = [
  UserController,
  CourseController,
  StudentCourseController,
  ExerciseController,
  StudentExerciseController
];

export const ImportServices = [
  CourseService,
  StudentCourseService,
  UserService,
  ExerciseService,
  StudentExerciseService,
  AuthService
];
