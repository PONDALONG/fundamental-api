import { Injectable } from '@nestjs/common';
import { CreateCourseExerciseDto } from './dto/create-course-exercise.dto';
import { UpdateCourseExerciseDto } from './dto/update-course-exercise.dto';

@Injectable()
export class CourseExerciseService {
  create(createCourseExerciseDto: CreateCourseExerciseDto) {
    return 'This action adds a new courseExercise';
  }

  findAll() {
    return `This action returns all courseExercise`;
  }

  findOne(id: number) {
    return `This action returns a #${id} courseExercise`;
  }

  update(id: number, updateCourseExerciseDto: UpdateCourseExerciseDto) {
    return `This action updates a #${id} courseExercise`;
  }

  remove(id: number) {
    return `This action removes a #${id} courseExercise`;
  }
}
