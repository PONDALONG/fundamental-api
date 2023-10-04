import { User } from "../entities/user.entity";

export class UserToCsv {
  firstname: string;
  lastname: string;
  studentId: string;
  class: string;
  result: string;
  status: boolean;

  constructor(user: User, result: string, status: boolean) {
    this.firstname = user.firstname;
    this.lastname = user.lastname;
    this.studentId = user.studentCode;
    this.class = user.class;
    this.result = result;
    this.status = status;
  }
}