import { UserToCsv } from "./user-to-csv";
import { User } from "../entities/user.entity";

export class UserAndCsv {
  user: User[];
  userToCsv: UserToCsv[];
}