import { IsBlankNull, IsNumberStr } from "../../utils/custom-validator";
import { StudentAssignment } from "../entities/student-assignment.entity";

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

export class GroupAssignment {
  studentAssignments: StudentAssignment[] = Array<StudentAssignment>();
  stdAsmGroup: string;
}

export class sendAssignment {
  @IsNumberStr()
  stdAsmId: number;

  @IsBlankNull()
  stdAsmResult: string;

  deleteFileIds: string;

}