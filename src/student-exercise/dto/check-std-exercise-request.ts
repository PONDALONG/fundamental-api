import { IsNumberString } from "class-validator";

export class CheckStdExercise {
  @IsNumberString()
  exerciseId: number;

  @IsNumberString()
  stdExecId: number;

  @IsNumberString()
  stdExecScore: number;
}