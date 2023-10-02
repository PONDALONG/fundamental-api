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
import { ContentService } from "./content/content.service";
import { FileResource } from "./file-resource/entities/file-resource.entity";
import { FileExercise } from "./file-exercise/entities/file-exercise.entity";
import { FileResourceService } from "./file-resource/file-resource.service";
import { FileExerciseService } from "./file-exercise/file-exercise.service";
import { Content } from "./content/entities/content.entity";
import { ContentController } from "./content/content.controller";
import { FileResourceController } from "./file-resource/file-resource.controller";
import { FileExerciseController } from "./file-exercise/file-exercise.controller";

export const BaseImport = [];

export const ImportEntities = [
  User,
  Course,
  StudentCourse,
  Exercise,
  StudentExercise,
  Content,
  FileResource,
  FileExercise
];
export const ImportControllers = [
  UserController,
  CourseController,
  StudentCourseController,
  ExerciseController,
  StudentExerciseController,
  ContentController,
  FileResourceController,
  FileExerciseController
];

export const ImportServices = [
  CourseService,
  StudentCourseService,
  UserService,
  ExerciseService,
  StudentExerciseService,
  AuthService,
  ContentService,
  FileResourceService,
  FileExerciseService
];
