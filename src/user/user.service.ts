import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import * as csv from "csv-parser";
import { Readable } from "stream";
import { Repository } from "typeorm";
import { AuthService } from "../auth/auth.service";
import { User } from "./entities/user.entity";
import { UserRole, UserStatus } from "./dto/user.enum";
import { createWriteStream } from "fs";
import { Constant } from "../utils/constant";
import * as path from "path";
import { LoginRequest, UserAndCsv, UserToCsv } from "./dto/user.model";

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

  /*------------------- MAIN FUNCTION -------------------*/

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
          const user: User = await this.findOneByStudentId(u.studentCode);
          if (!!user) { //update user
            try {
              this.validateUser(u);
              try {

                user.userStatus = UserStatus.ACTIVE;
                user.firstname = u.firstname;
                user.lastname = u.lastname;
                user.class = u.class;
                const save: User = await this.repository.save(user);
                users.push(save);
                userCsv.push(new UserToCsv(save, "สำเร็จ", true));
              } catch (e) {
                throw new Error("บันทึกข้อมูลผิดพลาด : " + e.message);
              }
            } catch (e) {
              userCsv.push(new UserToCsv(user, e.message, false));
            }
          } else { //create user
            try {
              this.validateUser(u);
              u.password = this.encode(u.studentCode.trim() + "Ab*");
              try {
                const save: User = await this.repository.save(u);
                users.push(save);
                userCsv.push(new UserToCsv(save, "สำเร็จ", true));
              } catch (e) {
                throw new Error("บันทึกข้อมูลผิดพลาด : " + e.message);
              }
            } catch (e) {
              userCsv.push(new UserToCsv(u, e.message, false));
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

  async updateProfile(file: Express.Multer.File, user: User) {
    try {

      const destinationPath = `${Constant.UPLOAD_PATH_PROFILE}/${user.studentCode}.${file.originalname.split(".").pop()}`;

      createWriteStream(path.resolve(destinationPath)).write(file.buffer);

      user.image = destinationPath;
      return { image: (await this.repository.save(user)).image };
    } catch (e) {
      throw new BadRequestException("บันทึกข้อมูลผิดพลาด");
    }
  }

  async login(req: LoginRequest) {
    try {
      const user = await this.repository.findOne({ where: { studentCode: req.studentId } });

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


  /*------------------- SUB FUNCTION -------------------*/

  async findOne(id: number) {
    return await this.repository.findOne({ where: { userId: id } });
  }

  async findOneByStudentId(studentId: string) {
    return await this.repository.findOne({ where: { studentCode: studentId } });
  }

  async checkUser(user: User) {
    try {

      user = await this.repository.createQueryBuilder("user")
        .select([
          "user.userId",
          "user.firstname",
          "user.lastname",
          "user.studentCode",
          "user.role",
          "user.createDate"
        ]).where(
          "user.userId = :userId AND user.studentCode = :studentCode", user
        )
        .getOne();
      if (!user) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async findAdmin() {
    return await this.repository.findOne({ where: { studentCode: "admin" } });
  }

  encode(pwd: string) {
    return bcrypt.hashSync(pwd, this.salt);
  }

  async compare(pwd: string, hash: string) {
    return await bcrypt.compare(pwd, hash);
  }

  private async createAdmin() {
    try {
      let check = await this.findAdmin();
      if (check) return;
      const user = new User();
      user.firstname = "admin";
      user.lastname = "admin";
      user.studentCode = "admin";
      user.password = this.encode("admin" + "Ab*");
      user.role = UserRole.TEACHER;
      await this.repository.save(user);
    } catch (e) {
      console.error("createAdmin error : " + e.message);
    }
  }

  private mapUserToImports(data: User): User {
    console.log(data);
    const user = new User();
    user.firstname = data.firstname;
    user.lastname = data.lastname;
    user.studentCode = data.studentCode;
    user.class = data.class;
    return user;
  }

  private validateUser(user: User): void {
    const errors: string[] = [];
    if (!user.firstname || user.firstname.trim() == "") {
      errors.push("firstname");
    }
    if (!user.lastname || user.lastname.trim() == "") {
      errors.push("lastname");
    }
    if (!user.studentCode || user.studentCode.trim() == "") {
      errors.push("studentCode");
    }

    if (errors.length > 0) {
      throw new Error("กรุณาระบุ : " + errors.join(", "));
    }
  }
}
