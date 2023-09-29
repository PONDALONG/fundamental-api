import { Module } from "@nestjs/common";
import { CourseService } from "./course.service";
import { CourseController } from "./course.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Course } from "./entities/course.entity";
import { AuthModule } from "../auth/auth.module";
import { UserService } from "../user/user.service";
import { User } from "../user/entities/user.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, User]),
    AuthModule
  ],
  controllers: [CourseController],
  providers: [CourseService, UserService]
})
export class CourseModule {
}
