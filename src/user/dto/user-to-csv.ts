import { User } from "../entities/user.entity";

export class UserToCsv {
  constructor(user:User, result:string) {
    this.firstname = user.firstname;
    this.lastname = user.lastname;
    this.studentId = user.studentId;
    this.class = user.class;
    this.result = result;
  }
  firstname: string;
  lastname: string;
  studentId: string;
  class: string;
  result: string;
}