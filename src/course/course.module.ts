import { Module } from "@nestjs/common";
import { CourseService } from "./course.service";
import { CourseController } from "./course.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { UserService } from "../user/user.service";
import { BaseBaseEntity } from "../base-base-entity";

@Module({
  imports: [
    TypeOrmModule.forFeature(BaseBaseEntity),
    AuthModule
  ],
  controllers: [CourseController],
  providers: [CourseService, UserService]
})
export class CourseModule {
}
