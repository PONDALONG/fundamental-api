import { Module } from '@nestjs/common';
import { StudentExerciseService } from './student-exercise.service';
import { StudentExerciseController } from './student-exercise.controller';

@Module({
  controllers: [StudentExerciseController],
  providers: [StudentExerciseService],
})
export class StudentExerciseModule {}
