import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "./user/user.module";
import { User } from "./user/entities/user.entity";
import { StudentExerciseModule } from "./student-exercise/student-exercise.module";
import { StudentExercise } from "./student-exercise/entities/student-exercise.entity";
import { AuthModule } from "./auth/auth.module";
import { CourseModule } from "./course/course.module";
import { StudentCourseModule } from "./student-course/student-course.module";
import { ExerciseModule } from "./exercise/exercise.module";
import { StudentCourse } from "./student-course/entities/student-course.entity";
import { Exercise } from "./exercise/entities/exercise.entity";
import { Course } from "./course/entities/course.entity";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3307,
      username: "root",
      password: "root",
      database: "fundamental_db",
      entities: [User, StudentCourse, Exercise, Course, StudentExercise],
      synchronize: true
    }),
    UserModule,
    StudentExerciseModule,
    AuthModule,
    CourseModule,
    StudentCourseModule,
    ExerciseModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
}
