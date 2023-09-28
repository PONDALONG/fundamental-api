import { Module } from '@nestjs/common';
import { CourseExerciseService } from './course-exercise.service';
import { CourseExerciseController } from './course-exercise.controller';

@Module({
  controllers: [CourseExerciseController],
  providers: [CourseExerciseService],
})
export class CourseExerciseModule {}
