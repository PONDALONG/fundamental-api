import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import * as csv from "csv-parser";
import { Readable } from "stream";
import { Repository } from "typeorm";
import { AuthService } from "../auth/auth.service";
import { LoginRequestDto } from "./dto/login-request.dto";
import { User } from "./entities/user.entity";
import { UserRole } from "./dto/user-role.enum";
import { UserToCsv } from "./dto/user-to-csv";
import { UserAndCsv } from "./dto/user-and-csv";

@Injectable()
export class UserService {
  private readonly salt = bcrypt.genSaltSync(10);

  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly authService: AuthService
  ) {
    this.createAdmin().then();
  }

  async imports(file: Express.Multer.File) {
    console.log(file);
    const users: User[] = [];
    const userCsv: UserToCsv[] = [];
    const userAndCsv = new UserAndCsv();
    try {

      let results = await new Promise((resolve, reject) => {
        const map: User[] = [];
        Readable.from(file.buffer.toString())
          .pipe(csv())
          .on("data", (data) => map.push(this.mapUserToImports(data)))
          .on("end", () => {
            resolve(map);
          })
          .on("error", () => {
            reject(map);
          });
      });

      if ((results as User[]).length > 0) {

        for (const u of (results as User[])) {
          const user = await this.findOneByStudentId(u.studentId);
          if (!!user) {
            users.push(user);
            userCsv.push(new UserToCsv(user, "duplicate"));
          } else {
            try {
              const save = await this.repository.save(u);
              users.push(save);
              userCsv.push(new UserToCsv(save, "success"));

            } catch (e) {
              userCsv.push(new UserToCsv(u, "Save Error : " + e.message));
            }
          }
        }
        userAndCsv.user = users;
        userAndCsv.userToCsv = userCsv;
        return userAndCsv;

      } else {
        throw new BadRequestException("no data");
      }

    } catch (e) {
      console.error("imports error : " + e.message);
      throw new HttpException(e.message, e.status | HttpStatus.INTERNAL_SERVER_ERROR);
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
          return { "access_token": token, profile: user };
        } else {
          throw new BadRequestException("password incorrect");
        }
      } else {
        throw new BadRequestException("user not found");
      }
    } catch (e) {
      console.error("login error : " + e.message);
      throw new HttpException(e.message, e.status);
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
    delete user.password;
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

  async findOneByStudentId(studentId: string) {
    return await this.repository.findOne({ where: { studentId: studentId } });
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
