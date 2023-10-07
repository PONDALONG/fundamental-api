import { ExerciseStatus, ExerciseType } from "./exercise.enum";
import { IsDateString, IsEnum, IsNotEmpty, IsNumberString } from "class-validator";
import { IsBlankNull } from "../../utils/custom-validator";

export class CreateExerciseRequest {

  @IsBlankNull()
  exerciseName: string;

  @IsBlankNull()
  exerciseDescription: string;

  @IsNumberString()
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