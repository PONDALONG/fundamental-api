import { IsBlankNull, IsNumberStr } from "../../utils/custom-validator";
import { User } from "../entities/user.entity";
import { UserRole, UserStatus } from "./user.enum";
import { IsEnum } from "class-validator";

export class LoginRequest {
  @IsBlankNull()
  studentCode: string;

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
  users: User[];
  userToCsv: UserToCsv[];
}

export class UserToCsv {
  nameTH: string;
  nameEN: string;
  studentNo: string;
  result: string;
  status: boolean;

  constructor(user: User, result: string, status: boolean) {
    this.nameTH = user.nameTH || null;
    this.nameEN = user.nameEN || null;
    this.studentNo = user.studentNo || null;
    this.result = result;
    this.status = status;
  }
}

export class adminCreate {
  nameTH = process.env.ADMIN_NAME_TH;
  nameEN = process.env.ADMIN_NAME_EN;
  studentNo = process.env.ADMIN_STUDENT_NO;
  password = process.env.ADMIN_PASSWORD;
  role = UserRole.TEACHER;
}

export class Template {
  STUDENT_NO: string;
  FULLNAME: string;
  FULLNAME_EN: string;

}

export class UpdateStatus {
  @IsNumberStr()
  userId: number;

  @IsEnum(UserStatus)
  userStatus: UserStatus;

}