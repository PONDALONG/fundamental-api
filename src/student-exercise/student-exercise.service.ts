import { Injectable } from '@nestjs/common';
import { CreateStudentExerciseDto } from './dto/create-student-exercise.dto';
import { UpdateStudentExerciseDto } from './dto/update-student-exercise.dto';

@Injectable()
export class StudentExerciseService {
  create(createStudentExerciseDto: CreateStudentExerciseDto) {
    return 'This action adds a new studentExercise';
  }

  findAll() {
    return `This action returns all studentExercise`;
  }

  findOne(id: number) {
    return `This action returns a #${id} studentExercise`;
  }

  update(id: number, updateStudentExerciseDto: UpdateStudentExerciseDto) {
    return `This action updates a #${id} studentExercise`;
  }

  remove(id: number) {
    return `This action removes a #${id} studentExercise`;
  }
}
