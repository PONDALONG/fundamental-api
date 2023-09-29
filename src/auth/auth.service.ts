import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "../user/entities/user.entity";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService
  ) {
  }

  async tokenize(user: User) {
    const payload = {
      userId: user.userId,
      firstname: user.firstname,
      lastname: user.lastname,
      studentId: user.studentId,
      role: user.role,
      createDate: user.createDate
    };
    return await this.jwtService.signAsync(payload);
  }
}
