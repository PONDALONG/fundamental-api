import { ExerciseStatus, ExerciseType } from "./exercise.enum";

export class CreateExercise {
  exerciseName: string;
  exerciseDescription: string;
  exerciseScore: number;
  exerciseStatus: ExerciseStatus;
  exerciseStartDate: Date;
  exerciseEndDate: Date;
  roomId: number;
  exerciseType: ExerciseType;
}