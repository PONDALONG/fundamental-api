import { ExerciseStatus, ExerciseType } from "./exercise.enum";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsNumberString, ValidateIf } from "class-validator";

export class CreateExercise {

  @IsNotEmpty()
  exerciseName: string;

  @IsNotEmpty()
  exerciseDescription: string;

  @IsNotEmpty()
  exerciseScore: number;

  @IsEnum(ExerciseStatus)
  exerciseStatus: ExerciseStatus;

  @IsNotEmpty()
  @IsDateString()
  exerciseEndDate: Date;

  @IsNumberString()
  roomId: number;

  @IsEnum(ExerciseType)
  exerciseType: ExerciseType;
}