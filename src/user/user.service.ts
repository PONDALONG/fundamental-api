import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { loginRequestDto } from "./dto/login-request.dto";
import { AuthService } from "../auth/auth.service";
import { Readable } from "stream";
import * as csv from "csv-parser";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly authService: AuthService
  ) {

  }

  create(createUserDto: CreateUserDto) {
    return "This action adds a new user";
  }

  async imports(file: Express.Multer.File) {

    try {
      const arr: string[] = await this.findAllStudentId();
      const users: User[] = [];

      let results = await new Promise((resolve, reject) => {
        Readable.from(file.buffer.toString())
          .pipe(csv())
          .on("data", (data) => users.push(this.mapUserToImports(data)))
          .on("end", () => {
            resolve(users);
          })
          .on("error", (error) => {
            reject(error);
          });
      });

      results = (results as User[]).filter((user: User) => !arr.includes(user.studentId));
      if ((results as User[]).length > 0)
        await this.repository.save(results);

    } catch (error) {
      console.log(error.message);
    }
  }

  findAll(): Promise<User[]> {
    return this.repository.createQueryBuilder("user").select(["user.userId", "user.role"]).getMany();
  }

  async findAllStudentId() {
    const users = await this.repository.createQueryBuilder("user").select(["user.studentId"]).getMany();
    const studentId: string[] = [];

    for (let user of users) studentId.push(user.studentId);

    return studentId;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async login(req: loginRequestDto) {
    let user = await this.repository.findOne({ where: { studentId: req.studentId, password: req.password } });
    if (user) {
      return this.authService.signIn(user);
    } else {
      return "invalid username or password";
    }
  }


  mapUserToImports(data: User): User {
    let user = new User();
    user.firstname = data.firstname;
    user.lastname = data.lastname;
    user.studentId = data.studentId;
    user.password = data.studentId;
    return user;
  }
}
