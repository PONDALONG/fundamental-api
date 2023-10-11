import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import * as csv from "csv-parser";
import { Readable } from "stream";
import { Repository } from "typeorm";
import { AuthService } from "../auth/auth.service";
import { User } from "./entities/user.entity";
import { UserStatus } from "./dto/user.enum";
import { createWriteStream } from "fs";
import { Constant } from "../utils/constant";
import * as path from "path";
import { adminCreate, ChangePassword, LoginRequest, Template, UserAndCsv, UserToCsv } from "./dto/user.model";

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
        Readable.from(file.buffer.toString("utf-8"))
          .pipe(csv())
          .on("data", (data) => map.push(this.mapUserToImports(data as Template)))
          .on("end", () => {
            resolve(map);
          })
          .on("error", () => {
            reject(map);
          });
      });

      if ((results as User[]).length > 0) {

        for (const u of (results as User[])) {
          const user: User = await this.findOneByStudentId(u.studentNo);
          if (!!user) { //update user
            try {
              this.validateUser(u);
              try {

                user.userStatus = UserStatus.ACTIVE;
                user.nameTH = u.nameTH;
                user.nameEN = u.nameEN;
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
              u.password = this.encode(u.studentNo.trim() + Constant.PASSWORD);
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

      const destinationPath = `${Constant.UPLOAD_PATH_PROFILE}/${user.studentNo}.${file.originalname.split(".").pop()}`;

      createWriteStream(path.resolve(destinationPath)).write(file.buffer);

      user.image = destinationPath;
      return { image: (await this.repository.save(user)).image };
    } catch (e) {
      throw new BadRequestException("บันทึกข้อมูลผิดพลาด");
    }
  }

  async login(req: LoginRequest) {
    try {
      const user = await this.repository.findOne({ where: { studentNo: req.studentId } });

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

  async resetPassword(userId: number) {

    try {

      const user = await this.repository.findOne({ where: { userId: userId } });

      if (!user) throw new BadRequestException("ไม่พบผู้ใช้งาน");

      user.password = this.encode(user.studentNo + Constant.PASSWORD);
      await this.repository.save(user);

    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async changePassword(user: User, input: ChangePassword) {

    try {

      if (!user) throw new BadRequestException("ไม่พบผู้ใช้งาน");

      if (!await this.compare(input.oldPassword, user.password)) throw new BadRequestException("รหัสผ่านเดิมไม่ถูกต้อง");

      user.password = this.encode(input.newPassword);
      await this.repository.save(user);

    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }


  /*------------------- SUB FUNCTION -------------------*/

  async findOne(id: number) {
    return await this.repository.findOne({ where: { userId: id } });
  }

  async findOneByStudentId(studentId: string) {
    return await this.repository.findOne({ where: { studentNo: studentId } });
  }

  async checkUser(user: User) {
    try {

      user = await this.repository.createQueryBuilder("user")
        .select([
          "user.userId",
          "user.firstname",
          "user.lastname",
          "user.studentNo",
          "user.role",
          "user.createDate"
        ]).where(
          "user.userId = :userId AND user.studentNo = :studentNo", user
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

  async findAdmin(studentNo: string) {
    return await this.repository.findOne({ where: { studentNo: studentNo } });
  }

  encode(pwd: string) {
    return bcrypt.hashSync(pwd, this.salt);
  }

  async compare(pwd: string, hash: string) {
    return await bcrypt.compare(pwd, hash);
  }

  private async createAdmin() {
    try {
      const admin = new adminCreate();
      let check = await this.findAdmin(admin.studentNo);
      if (check) return;
      const user = new User();
      user.nameTH = admin.firstname;
      user.nameEN = admin.lastname;
      user.studentNo = admin.studentNo;
      user.role = admin.role;
      user.password = this.encode(admin.studentNo + Constant.PASSWORD);
      await this.repository.save(user);
    } catch (e) {
      console.error("createAdmin error : " + e.message);
    }
  }

  private mapUserToImports(data: Template): User {
    data = JSON.parse(JSON.stringify(data).replaceAll("\ufeff", ""));
    const user = new User();
    user.nameTH = data.FULLNAME;
    user.nameEN = data.FULLNAME_EN;
    user.studentNo = data.STUDENT_NO;
    return user;
  }

  private validateUser(user: User): void {
    const errors: string[] = [];
    if (!user.nameTH || user.nameTH.trim() == "") {
      errors.push("FULLNAME");
    }
    if (!user.nameEN || user.nameEN.trim() == "") {
      errors.push("FULLNAME_EN");
    }
    if (!user.studentNo || user.studentNo.trim() == "") {
      errors.push("STUDENT_NO");
    }

    if (errors.length > 0) {
      throw new Error("กรุณาระบุ : " + errors.join(", "));
    }
  }
}
