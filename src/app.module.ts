import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "./user/user.module";
import { StudentExerciseModule } from "./student-exercise/student-exercise.module";
import { AuthModule } from "./auth/auth.module";
import { CourseModule } from "./course/course.module";
import { StudentCourseModule } from "./student-course/student-course.module";
import { ExerciseModule } from "./exercise/exercise.module";
import { BaseControllers, BaseBaseEntity, BaseServices } from "./base-base-entity";
import * as process from "process";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env"
    }),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: BaseBaseEntity,
      synchronize: true
    })
    ,
    TypeOrmModule.forFeature(BaseBaseEntity)
    // UserModule,
    // StudentExerciseModule,
    // AuthModule,
    // CourseModule,
    // StudentCourseModule,
    // ExerciseModule
  ],
  controllers: BaseControllers,
  providers: BaseServices
})
export class AppModule {
}
