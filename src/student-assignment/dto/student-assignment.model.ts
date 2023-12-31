import { IsBlankNull, IsNumberStr } from "../../utils/custom-validator";
import { StudentAssignment } from "../entities/student-assignment.entity";

export class CheckStdAsm {

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

  @IsBlankNull()
  stdAsmGroup: number;

  @IsBlankNull()
  stdAsmId: number;
}

export class GroupAssignment {
  studentAssignments: StudentAssignment[] = Array<StudentAssignment>();
  stdAsmGroup: number;
}

export class SendAssignment {
  @IsNumberStr()
  stdAsmId: number;

  stdAsmResult: string;

  deleteFileIds: string;

}