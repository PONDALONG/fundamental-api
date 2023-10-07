import { IsBlankNull } from "../../utils/custom-validator";

export class LoginRequest {
  @IsBlankNull()
  studentId: string;

  @IsBlankNull()
  password: string;
}
