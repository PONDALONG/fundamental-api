import { User } from "../entities/user.entity";

export class UserToCsv {
  firstname: string;
  lastname: string;
  studentId: string;
  class: string;
  result: string;

  constructor(user: User, result: string) {
    this.firstname = user.firstname;
    this.lastname = user.lastname;
    this.studentId = user.studentId;
    this.class = user.class;
    this.result = result;
  }
}