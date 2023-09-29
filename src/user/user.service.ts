import { HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import * as csv from "csv-parser";
import { Readable } from "stream";
import { Repository } from "typeorm";
import { AuthService } from "../auth/auth.service";
import { LoginRequestDto } from "./dto/login-request.dto";
import { User } from "./entities/user.entity";
import { UserRole } from "./dto/user-role.enum";

@Injectable()
export class UserService {
  private readonly salt = bcrypt.genSaltSync(10);
  private readonly BAD_REQUEST = HttpStatus.BAD_REQUEST;

  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly authService: AuthService
  ) {
    this.createAdmin().then();
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
      if ((results as User[]).length > 0) {
        const save = await this.repository.save(results);
        if (!save) throw new HttpException("save error", this.BAD_REQUEST);
      } else {
        throw new HttpException("no data", this.BAD_REQUEST);
      }

    } catch (error) {
      console.error("imports error : " + error.message);
      throw new HttpException(error.message, error.status | HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  findAll(): Promise<User[]> {
    return this.repository.createQueryBuilder("user").select(["user.userId", "user.role"]).getMany();
  }

  async findAllStudentId() {
    const users = await this.repository.createQueryBuilder("user").select(["user.studentId"]).getMany();
    const studentId: string[] = [];

    for (let user of users) {
      studentId.push(user.studentId);
    }

    return studentId;
  }

  async login(req: LoginRequestDto) {
    try {
      const user = await this.repository.findOne({ where: { studentId: req.studentId } });

      if (user) {
        if (await this.compare(req.password, user.password)) {
          const token = await this.authService.tokenize(user);
          return { "access_token": token };
        } else {
          throw new HttpException("password incorrect", this.BAD_REQUEST);
        }
      } else {
        throw new HttpException("user not found", this.BAD_REQUEST);
      }
    } catch (error) {
      console.error("login error : " + error.message);
      throw new HttpException(error.message, error.status);
    }
  }

  async createAdmin() {
    try {
      let check = await this.findAdmin();
      if (check) return;
      const user = new User();
      user.firstname = "admin";
      user.lastname = "admin";
      user.studentId = "admin";
      user.password = this.encode("admin" + "Ab*");
      user.role = UserRole.TEACHER;
      await this.repository.save(user);
    } catch (e) {
      console.error("createAdmin error : " + e.message);
    }

  }

  async checkUser(user: User) {
    user = await this.repository.createQueryBuilder("user")
      .select([
        "user.userId",
        "user.firstname",
        "user.lastname",
        "user.studentId",
        "user.role",
        "user.createDate"
      ]).where(
        "user.userId = :userId AND user.studentId = :studentId", user
      )
      .getOne();
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async findAdmin() {
    return await this.repository.findOne({ where: { studentId: "admin" } });
  }

  encode(pwd: string) {
    return bcrypt.hashSync(pwd, this.salt);
  }

  async compare(pwd: string, hash: string) {
    return await bcrypt.compare(pwd, hash);
  }

  async findOne(id: number) {
    return await this.repository.findOne({ where: { userId: id } });
  }

  private mapUserToImports(data: User): User {
    const user = new User();
    user.firstname = data.firstname.trim();
    user.lastname = data.lastname.trim();
    user.studentId = data.studentId.trim();
    user.password = this.encode(data.studentId.trim() + "Ab*");
    return user;
  }
}
