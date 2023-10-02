import { BadRequestException, Injectable } from "@nestjs/common";
import { StudentCourse } from "./entities/student-course.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../user/entities/user.entity";
import { Repository } from "typeorm";
import { CourseService } from "../course/course.service";
import { UserService } from "../user/user.service";
import { Course } from "../course/entities/course.entity";
import { UserAndCsv } from "../user/dto/user-and-csv";

@Injectable()
export class StudentCourseService {

  constructor(
    @InjectRepository(StudentCourse)
    private readonly repository: Repository<StudentCourse>,
    private readonly courseService: CourseService,
    private readonly userService: UserService
  ) {
  }

  async importStudent(file: Express.Multer.File, courseId: any) {

    try {
      const course = await this.courseService.findByCourseId(courseId);
      if (!course) throw new BadRequestException("course not found");

      const res: UserAndCsv = await this.userService.imports(file);

      for (const i in res.user) {
        try {
          const haveStd = await this.findByUserAndCourse(res.user[i], course);
          if (!!haveStd) {
            res.userToCsv[i].resultCreateStudentCourse = "duplicate";
            throw new Error("duplicate");
          }

          const stdCourse = new StudentCourse();
          stdCourse.user = res.user[i];
          stdCourse.course = course;
          const save = await this.repository.save(stdCourse);
          res.userToCsv[i].resultCreateStudentCourse = "success";
        } catch (e) {
          res.userToCsv[i].resultCreateStudentCourse = "save error : " + e.message;
        }
      }
      return res.userToCsv;
    } catch (e) {
      throw e;
    }
  }

  async findAllByUser(user: User) {
    return await this.repository.find(
      {
        where: {
          user: user
        }
      }
    );
  }

  async findAll() {
    return await this.repository.find(
      {
        relations: ["user", "course"]
      }
    );
  }

  async findByUserAndCourse(user: User, course: Course) {
    return await this.repository.findOne(
      {
        where: {
          user: user,
          course: course
        }
      });
  }
}