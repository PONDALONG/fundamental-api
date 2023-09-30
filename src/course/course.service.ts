import { BadRequestException, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Course } from "./entities/course.entity";
import { CourseCreateRequestDto } from "./dto/course-create-request.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { MyLogger } from "../utils/MyLogger";

@Injectable()
export class CourseService {
  private readonly logger = new MyLogger(CourseService.name);

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
}