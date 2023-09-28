import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "./user/user.module";
import { User } from "./user/entities/user.entity";
import { CourseExerciseModule } from "./course-exercise/course-exercise.module";
import { StudentExerciseModule } from "./student-exercise/student-exercise.module";
import { CourseExercise } from "./course-exercise/entities/course-exercise.entity";
import { StudentExercise } from "./student-exercise/entities/student-exercise.entity";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3307,
      username: "root",
      password: "root",
      database: "fundamental_db",
      entities: [User, CourseExercise, StudentExercise],
      synchronize: true
    }),
    UserModule,
    CourseExerciseModule,
    StudentExerciseModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
}
