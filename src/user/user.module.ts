import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { AuthModule } from "../auth/auth.module";
import { CsvModule } from "nest-csv-parser";
import { BaseBaseEntity } from "../base-base-entity";
import { StudentCourseModule } from "../student-course/student-course.module";

@Module({
  imports: [
    TypeOrmModule.forFeature(BaseBaseEntity),
    AuthModule,
    CsvModule,
    StudentCourseModule
  ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {
}
