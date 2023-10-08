import { AssignmentStatus, AssignmentType } from "./assignment.enum";
import { IsDateString, IsEnum, IsNotEmpty, IsNumberString } from "class-validator";
import { IsBlankNull } from "../../utils/custom-validator";

export class CreateAssignment {

  @IsBlankNull()
  assignmentName: string;

  @IsBlankNull()
  assignmentDescription: string;

  @IsNumberString()
  assignmentScore: number;

  @IsEnum(AssignmentStatus)
  assignmentStatus: AssignmentStatus;

  @IsNotEmpty()
  @IsDateString()
  assignmentEndDate: Date;

  @IsNumberString()
  roomId: number;

  @IsEnum(AssignmentType)
  assignmentType: AssignmentType;
}

export class UpdateAssignment extends CreateAssignment {

  @IsNumberString()
  assignmentId: number;

  deleteFileIds: string;

}