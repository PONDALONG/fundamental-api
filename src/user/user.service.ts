import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
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
import {
  adminCreate,
  ChangePassword,
  LoginRequest,
  Template,
  UpdateStatus,
  UserAndCsv,
  UserToCsv
} from "./dto/user.model";
import * as xlsx from "xlsx";
import { Student } from "../student/entities/student.entity";

@Injectable()
export class UserService {
  private readonly salt = bcrypt.genSaltSync(10);

  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly authService: AuthService
  ) {
    this.createAdmin().then();
  }

  /*------------------- MAIN FUNCTION -------------------*/

  async imports(file: Express.Multer.File) {
    const users: User[] = [];
    const userCsv: UserToCsv[] = [];
    const userAndCsv = new UserAndCsv();
    try {

      const contentType = file.originalname.split(".").pop();
      let results = contentType === "csv" ? await this.readCSV(file) : this.readXLSX(file);

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
              u.password = this.encode(u.studentNo.trim() + process.env.CONCAT_PASSWORD);
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
        userAndCsv.users = users;
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

      createWriteStream(path.resolve(Constant.PUBLIC_PATH + "/" + destinationPath)).write(file.buffer);

      user.image = destinationPath;
      return await this.repository.save(user);
    } catch (e) {
      throw new BadRequestException("บันทึกข้อมูลผิดพลาด");
    }
  }

  async login(req: LoginRequest) {
    try {
      const user = await this.repository.findOne(
        {
          where:
            {
              studentNo: req.studentCode, userStatus: UserStatus.ACTIVE
            }
        }
      );

      if (!!user) {
        if (await this.compare(req.password, user.password)) {
          const token = await this.authService.tokenize(user);
          return { "access_token": token, profile: user };
        } else {
          throw new BadRequestException("รหัสผ่านไม่ถูกต้อง");
        }
      } else {
        throw new BadRequestException("ไม่พบผู้ใช้งาน");
      }
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }

  async resetPassword(userId: number) {

    try {

      const user = await this.repository.findOne({ where: { userId: userId } });

      if (!user) throw new BadRequestException("ไม่พบผู้ใช้งาน");

      user.password = this.encode(user.studentNo + process.env.CONCAT_PASSWORD);
      await this.repository.save(user);

    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async changePassword(userInput: User, input: ChangePassword) {

    try {

      const user = await this.repository.findOne({ where: { userId: userInput.userId } });

      if (!user) throw new BadRequestException("ไม่พบผู้ใช้งาน");

      if (!await this.compare(input.oldPassword, user.password)) throw new BadRequestException("รหัสผ่านเดิมไม่ถูกต้อง");

      user.password = this.encode(input.newPassword);
      await this.repository.save(user);

    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async me(user: User) {
    const profile = await this.studentRepository.createQueryBuilder("student")
      .innerJoin("student.user", "user")
      .innerJoin("student.room", "room")
      .select(["user", "student.studentId", "room.roomGroup", "room.roomYear", "room.roomTerm"])
      .where("user.userId = :userId", user)
      .getOne();

    if (!profile) throw new NotFoundException("ไม่พบผู้ใช้งาน");

    return profile;
  }

  /*------------------- SUB FUNCTION -------------------*/

  async findOne(id: number) {
    return await this.repository.findOne({ where: { userId: id } });
  }

  async findOneByStudentId(studentId: string) {
    return await this.repository.findOne({ where: { studentNo: studentId, role: UserRole.STUDENT } });
  }

  async checkUser(user: User) {
    try {

      user = await this.repository.createQueryBuilder("user")
        .select([
          "user.userId",
          "user.nameTH",
          "user.nameEN",
          "user.studentNo",
          "user.role",
          "user.createDate"
        ]).where(
          "user.userId = :userId AND user.studentNo = :studentNo", user
        )
        .andWhere("user.userStatus = :userStatus", { userStatus: UserStatus.ACTIVE })
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

  async updateStatus(input: UpdateStatus) {

    try {
      const user = await this.repository.findOne({ where: { userId: input.userId } });
      if (!user) throw new BadRequestException("ไม่พบผู้ใช้งาน");
      user.userStatus = input.userStatus;
      await this.repository.save(user);
      return user;
    } catch (e) {
      throw new BadRequestException(e.message);
    }

  }

  private async createAdmin() {
    try {
      const admin = new adminCreate();
      let check = await this.findAdmin(admin.studentNo);
      if (check) {
        check.nameTH = admin.nameTH;
        check.nameEN = admin.nameEN;
        check.role = admin.role;
        check.password = this.encode(admin.password);
        await this.repository.save(check);
      } else {
        const user = new User();
        user.nameTH = admin.nameTH;
        user.nameEN = admin.nameEN;
        user.studentNo = admin.studentNo;
        user.role = admin.role;
        user.password = this.encode(admin.password);
        await this.repository.save(user);
      }

    } catch (e) {
      console.error("createAdmin error : " + e.message);
    }
  }

  private mapUserToImportsCSV(data: Template): User {
    data = JSON.parse(JSON.stringify(data).replaceAll("\ufeff", ""));
    const user = new User();
    user.nameTH = data["FULLNAME"];
    user.nameEN = data["FULLNAME_EN"];
    user.studentNo = data["STUDENT_NO"];
    return user;
  }

  private mapUserToImportsXLSX(data: Template[]): User[] {
    const users: User[] = [];
    data = JSON.parse(JSON.stringify(data).replaceAll("\ufeff", ""));
    for (const u of data) {
      const user = new User();
      user.nameTH = u.FULLNAME;
      user.nameEN = u.FULLNAME_EN;
      user.studentNo = u.STUDENT_NO;
      users.push(user);
    }
    return users;
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

  private async readCSV(file: Express.Multer.File) {

    return await new Promise((resolve, reject) => {
      const map: User[] = [];
      Readable.from(file.buffer.toString("utf-8"))
        .pipe(csv())
        .on("data", (data) => {
          map.push(this.mapUserToImportsCSV(data as Template));
        })
        .on("end", () => {
          resolve(map);
        })
        .on("error", () => {
          reject(map);
        });
    });
  }

  private readXLSX(file: Express.Multer.File) {
    if (file.buffer) {
      const workbook = xlsx.read(file.buffer, { type: "buffer" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      return this.mapUserToImportsXLSX(xlsx.utils.sheet_to_json(sheet) as Template[]);
    } else {
      return [];
    }
  }
}
