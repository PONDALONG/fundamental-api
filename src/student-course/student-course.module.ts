import { Module } from "@nestjs/common";
import { StudentCourseService } from "./student-course.service";
import { StudentCourseController } from "./student-course.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BaseBaseEntity } from "../base-base-entity";

@Module({
  imports:[
    TypeOrmModule.forFeature(BaseBaseEntity),
  ],
  controllers: [StudentCourseController],
  providers: [StudentCourseService]
})
export class StudentCourseModule {
}
