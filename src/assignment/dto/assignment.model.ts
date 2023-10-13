import { AssignmentStatus, AssignmentType } from "./assignment.enum";
import { IsDateString, IsEnum, IsNotEmpty } from "class-validator";
import { IsBlankNull, IsNumberStr } from "../../utils/custom-validator";

export class CreateAssignment {

  @IsBlankNull()
  assignmentName: string;

  // @IsBlankNull()
  assignmentDescription: string;

  @IsNumberStr()
  assignmentScore: number;

  @IsEnum(AssignmentStatus)
  assignmentStatus: AssignmentStatus;

  @IsNotEmpty()
  @IsDateString()
  assignmentEndDate: Date;

  roomId: number;

  @IsEnum(AssignmentType)
  assignmentType: AssignmentType;
}

export class UpdateAssignment extends CreateAssignment {

  @IsNumberStr()
  assignmentId: number;

  deleteFileIds: string;

}