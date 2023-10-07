import { CreateExerciseRequest } from "./create-exercise-request";
import { IsNumberString } from "class-validator";

export class UpdateExerciseRequest extends CreateExerciseRequest {

  @IsNumberString()
  exerciseId: number;

  deleteFileIds: string;

}