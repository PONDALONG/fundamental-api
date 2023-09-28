import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseExerciseDto } from './create-course-exercise.dto';

export class UpdateCourseExerciseDto extends PartialType(CreateCourseExerciseDto) {}
