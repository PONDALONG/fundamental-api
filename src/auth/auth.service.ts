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
      firstname: user.nameTH,
      lastname: user.nameEN,
      studentNo: user.studentNo,
      role: user.role,
      createDate: user.createDate
    };
    try {
      return this.jwtService.signAsync(payload);
    } catch (error) {
      throw error;
    }
  }
}
