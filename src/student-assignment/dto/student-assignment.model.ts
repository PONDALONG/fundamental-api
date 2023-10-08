import { IsBlankNull, IsNumberStr } from "../../utils/custom-validator";

export class CheckStdAsm {
  @IsNumberStr()
  assignmentId: number;

  @IsNumberStr()
  stdAsmId: number;

  @IsNumberStr()
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

  @IsNumberStr()
  assignmentId: number;

  @IsBlankNull()
  stdAsmGroup: string;

  @IsBlankNull()
  stdAsmIds: number[];
}