import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { UserRole } from "./dto/user-role.enum";

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>
  ) {
  }

  async checkTeacher(user: User) {
    try {
      user = await this.repository.findOne({ where: { role: UserRole.TEACHER } });
      if (!user) throw new HttpException("user not found", HttpStatus.NOT_FOUND);
    } catch (error) {
      throw error;
    }
  }
}
