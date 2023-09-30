import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "./user/user.module";
import { StudentExerciseModule } from "./student-exercise/student-exercise.module";
import { AuthModule } from "./auth/auth.module";
import { CourseModule } from "./course/course.module";
import { StudentCourseModule } from "./student-course/student-course.module";
import { ExerciseModule } from "./exercise/exercise.module";
import { BaseEntity } from "./base-entity";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3307,
      username: "root",
      password: "root",
      database: "fundamental_db",
      entities: BaseEntity,
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
