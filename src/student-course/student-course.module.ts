import { Module } from "@nestjs/common";
import { StudentCourseService } from "./student-course.service";
import { StudentCourseController } from "./student-course.controller";

@Module({
  controllers: [StudentCourseController],
  providers: [StudentCourseService]
})
export class StudentCourseModule {
}
