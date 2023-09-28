import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "../user/entities/user.entity";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService
  ) {
  }
  async signIn(user:User) {

    const payload = {userId:user.userId,studentId:user.studentId,role:user.role};
    return {
      access_token: await this.jwtService.signAsync(payload)
    };
  }
}
