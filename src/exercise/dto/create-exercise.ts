import { ExerciseStatus } from "./exercise-status.enum";

export class CreateExercise {
  exerciseName: string;
  exerciseDescription: string;
  exerciseScore: number;
  exerciseStatus: ExerciseStatus;
  exerciseStartDate: Date;
  exerciseEndDate: Date;
  roomId: number;
}