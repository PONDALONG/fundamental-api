import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentExerciseDto } from './create-student-exercise.dto';

export class UpdateStudentExerciseDto extends PartialType(CreateStudentExerciseDto) {}
