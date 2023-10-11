import { IsBlankNull } from "../../utils/custom-validator";
import { User } from "../entities/user.entity";
import { UserRole, UserStatus } from "./user.enum";

export class LoginRequest {
  @IsBlankNull()
  studentId: string;

  @IsBlankNull()
  password: string;
}

export class ChangePassword {
  @IsBlankNull()
  oldPassword: string;

  @IsBlankNull()
  newPassword: string;
}

export class resetPassword {
  @IsBlankNull()
  userId: number;
}


export class UserAndCsv {
  user: User[];
  userToCsv: UserToCsv[];
}

export class UserToCsv {
  firstname: string;
  lastname: string;
  studentId: string;
  result: string;
  status: boolean;

  constructor(user: User, result: string, status: boolean) {
    this.firstname = user.nameTH;
    this.lastname = user.nameEN;
    this.studentId = user.studentNo;
    this.result = result;
    this.status = status;
  }
}

export class adminCreate {
  firstname = "admin";
  lastname = "admin";
  studentNo = "00000000000-0";
  class = "admin";
  role = UserRole.TEACHER;
  userStatus = UserStatus.ACTIVE;


}

export class Template {
  STUDENT_NO: string;
  FULLNAME: string;
  FULLNAME_EN: string;

}