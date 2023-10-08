import { IsNumberString } from "class-validator";
import { IsBlankNull } from "../../utils/custom-validator";

export class CheckStdAsm {
  @IsNumberString()
  assignmentId: number;

  @IsNumberString()
  stdAsmId: number;

  @IsNumberString()
  stdAsmScore: number;
}

export class SendAssignmentRequest {
  assignmentId: number;
  studentId: number;
  stdAsmResult: string;
  stdAsmStatus: string;
  stdAsmScore: number;
}

export class FormIntoGroups {

  @IsNumberString()
  assignmentId: number;

  @IsBlankNull()
  stdAsmGroup: string;

  @IsBlankNull()
  stdAsmIds: number[];
}