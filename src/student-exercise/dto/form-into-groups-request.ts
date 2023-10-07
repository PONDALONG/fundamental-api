import { IsBlankNull } from "../../utils/custom-validator";
import { IsNumberString } from "class-validator";

export class FormIntoGroups {

  @IsNumberString()
  exerciseId: number;

  @IsBlankNull()
  stdExecGroup: string;

  @IsBlankNull()
  stdExecIds: number[];
}