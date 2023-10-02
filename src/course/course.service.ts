import { BadRequestException, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Course } from "./entities/course.entity";
import { CourseCreateRequestDto } from "./dto/course-create-request.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../user/entities/user.entity";
import { StdCourseStatus } from "../student-course/entities/stdCourseStatus";

@Injectable()
export class CourseService {

  constructor(
    @InjectRepository(Course)
    private readonly repository: Repository<Course>
  ) {
  }

  async create(input: CourseCreateRequestDto) {
    try {
      await this.checkDuplicateCourse(input);
      const course = new Course();
      course.courseName = input.courseName.trim();
      course.courseDescription = input.courseDescription.trim();
      course.courseYear = input.courseYear;
      course.courseGroup = input.courseGroup.trim();
      course.courseTerm = input.courseTerm;

      const save = await this.repository.save(course);
      if (!save) throw new BadRequestException("save error");
    } catch (e) {
      throw e;
    }
  }

  async checkDuplicateCourse(input: CourseCreateRequestDto) {
    try {
      const course = await this.repository.findOne({
        where: {
          courseName: input.courseName.trim(),
          courseYear: input.courseYear,
          courseGroup: input.courseGroup.trim(),
          courseTerm: input.courseTerm
        }
      });
      if (course) throw new BadRequestException("course duplicate");
    } catch (e) {
      throw e;
    }
  }

  async findAll() {
    try {
      const result = await this.repository.find();
      return result;
    } catch (e) {
      throw e;
    }
  }

  async findByCourseId(courseId: number) {
    try {
      const result = await this.repository.findOne({
        where: {
          courseId: courseId
        }
      });
      return result;
    } catch (e) {
      throw e;
    }
  }

  async findAllByUser(user: User) {
    return await this.repository.find(
      {
        where: {
          studentCourse: {
            user: {
              userId: user.userId
            },
            stdCourseStatus: StdCourseStatus.ACTIVE
          }
        }
      }
    );
  }
}