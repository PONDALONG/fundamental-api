import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { StudentAssignment } from "./entities/student-assignment.entity";
import { DataSource, In, Repository } from "typeorm";
import { Assignment } from "../assignment/entities/assignment.entity";
import { Student } from "../student/entities/student.entity";
import { AssignmentType } from "../assignment/dto/assignment.enum";
import { CheckStdAsm, FormIntoGroups, GroupAssignment, SendAssignment } from "./dto/student-assignment.model";
import { stdAsmStatus } from "./dto/student-assignment.enum";
import { AppUtils } from "../utils/app.utils";
import { Constant } from "../utils/constant";
import * as fs from "fs";
import * as path from "path";
import { FileResult } from "../file-resource/dto/file-resource.model";
import { FileResource } from "../file-resource/entities/file-resource.entity";
import { FileResourceType } from "../file-resource/entities/file-resource-type.enum";
import { User } from "../user/entities/user.entity";

@Injectable()
export class StudentAssignmentService {
  constructor(
    @InjectRepository(StudentAssignment)
    private readonly repository: Repository<StudentAssignment>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(FileResource)
    private readonly fileResourceRepository: Repository<FileResource>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private dataSource: DataSource
  ) {
  }

  /*------------------- MAIN FUNCTION -------------------*/

  autoGenerate(assignment: Assignment, students: Student[]): StudentAssignment[] {
    const studentAssignments: StudentAssignment[] = Array<StudentAssignment>();

    for (const student of students) {
      const save = new StudentAssignment();
      save.assignment = assignment;
      save.student = student;
      studentAssignments.push(save);
    }

    return studentAssignments;
  }

  async findAll(assignmentId: number) {

    if (isNaN(Number(assignmentId))) throw new NotFoundException("assignmentId ต้องเป็นตัวเลข");

    const assignment = await this.assignmentRepository.findOne({
      where: {
        assignmentId: assignmentId
      }
    });

    if (!assignment) throw new NotFoundException("ไม่พบข้อมูล แบบฝึกหัด");
    const data = await this.repository.createQueryBuilder("stdAsm")
      .innerJoin("stdAsm.student", "student")
      .innerJoin("student.user", "user")
      .innerJoin("stdAsm.assignment", "assignment")
      .select([
        "stdAsm.stdAsmId", "stdAsm.stdAsmStatus", "stdAsm.stdAsmGroup", "stdAsm.stdAsmDateTime", "stdAsm.stdAsmScore",
        "student.studentId",
        "user.nameTH", "user.nameEN", "user.studentNo"
      ])
      .where("stdAsm.assignment.assignmentId = :assignmentId", assignment)
      .orderBy(
        assignment.assignmentType === AssignmentType.INDIVIDUAL
          ? "user.studentNo"
          : "IF(stdAsm.stdAsmGroup IS NULL, 99999999999, stdAsm.stdAsmGroup)",
        "ASC")
      .addOrderBy(
        assignment.assignmentType === AssignmentType.INDIVIDUAL
          ? "user.studentNo"
          : "stdAsm.stdAsmDateTime",
        assignment.assignmentType === AssignmentType.INDIVIDUAL
          ? "ASC"
          : "DESC"
      )
      .getMany();


    if (assignment.assignmentType === AssignmentType.INDIVIDUAL) return data;

    const groups: GroupAssignment[] = Array<GroupAssignment>();

    for (const stdAsm of data) {
      if (groups.length === 0) {
        const group = new GroupAssignment();
        group.stdAsmGroup = stdAsm.stdAsmGroup;
        group.studentAssignments.push(stdAsm);
        groups.push(group);
      } else {
        const index = groups.findIndex((x) => x.stdAsmGroup === stdAsm.stdAsmGroup);
        if (index >= 0) {
          groups[index].studentAssignments.push(stdAsm);
        } else {
          const group = new GroupAssignment();
          group.stdAsmGroup = stdAsm.stdAsmGroup;
          group.studentAssignments.push(stdAsm);
          groups.push(group);
        }
      }
    }
    return groups;

  }

  async formIntoGroups(inputs: FormIntoGroups[]) {

    const stdAsms: StudentAssignment[] = Array<StudentAssignment>();
    for (const input of inputs) {
      try {
        const stdAsm = await this.repository.findOne({
          where: {
            stdAsmId: input.stdAsmId
          }
        });

        if (!stdAsm) throw new BadRequestException("ไม่พบข้อมูล แบบฝึกหัด");

        stdAsm.stdAsmGroup = input.stdAsmGroup;
        stdAsms.push(stdAsm);

      } catch (e) {
        throw new BadRequestException(e.message);
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(stdAsms);
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(e.message);
    } finally {
      await queryRunner.release();
    }

  }


  async checkAssignment(input: CheckStdAsm) {
    const stdAsm = await this.repository.createQueryBuilder("stdAsm")
      .innerJoin("stdAsm.assignment", "assignment")
      .select(["stdAsm", "assignment"])
      .where("stdAsm.stdAsmId = :stdAsmId", { stdAsmId: input.stdAsmId })
      .getOne();

    if (!stdAsm) {
      throw new BadRequestException("ไม่พบข้อมูล แบบฝึกหัด");
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    if (stdAsm.assignment.assignmentScore < input.stdAsmScore) throw new BadRequestException("คะแนนที่ให้มากกว่าคะแนนเต็ม");

    if (stdAsm.assignment.assignmentType === AssignmentType.INDIVIDUAL) {

      stdAsm.stdAsmScore = input.stdAsmScore;
      await queryRunner.manager.save(stdAsm);

    } else {

      try {
        const query = "UPDATE student_assignment SET std_asm_score = ? WHERE std_asm_group = ? and assignment_id = ?";

        await this.repository.query(query, [input.stdAsmScore, stdAsm.stdAsmGroup, stdAsm.assignment.assignmentId]);
      } catch (error) {
        throw new BadRequestException(`บันทึกข้อมูลผิดพลาด: ${error.message}`);
      }
    }
  }

  async sendAssignment(input: SendAssignment, files: Array<Express.Multer.File>, user: User) {
    const fileResponses: FileResult[] = [];
    let saveFile = true;
    let msgFileError = "";
    let listFile: Express.Multer.File[] = null;
    const stdAsm = await this.repository.findOne({
      where: {
        stdAsmId: input.stdAsmId,
        student: {
          user: user
        }
      }
    });

    if (!stdAsm) throw new NotFoundException("ไม่พบข้อมูล แบบฝึกหัด");

    if (!!files["files"]) {

      listFile = files["files"];
      for (const listFileElement of listFile) {

        try {
          const fileType = "." + listFileElement.originalname.split(".").pop();
          const random = new AppUtils().generateRandomString(5);
          let fileName = listFileElement.originalname.replace(fileType, "-" + random + fileType);
          const destinationPath = `${Constant.UPLOAD_PATH_STUDENT_ASSIGNMENT}/${fileName}`;

          fs.createWriteStream(path.resolve(Constant.PUBLIC_PATH + destinationPath)).write(listFileElement.buffer);
          fileResponses.push(new FileResult(listFileElement.originalname, destinationPath));

        } catch (error) {
          saveFile = false;
          msgFileError = error.message;
          break;
        }
      }
    }
    if (!saveFile) throw new BadRequestException("บันทึกไฟล์ไม่สำเร็จ : " + msgFileError);

    stdAsm.stdAsmStatus = stdAsmStatus.SUBMITTED;
    stdAsm.stdAsmResult = input.stdAsmResult;
    stdAsm.stdAsmDateTime = new Date();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const studentAssignment = await queryRunner.manager.save(stdAsm);

      const filesToSaveSave: FileResource[] = Array<FileResource>();
      for (const i of fileResponses) {
        const fileResource = new FileResource();
        fileResource.fileResourceName = i.fileName;
        fileResource.fileResourcePath = i.filePath;
        fileResource.studentAssignment = studentAssignment;
        fileResource.fileResourceType = FileResourceType.STUDENT_ASSIGNMENT;
        filesToSaveSave.push(fileResource);
      }
      if (filesToSaveSave.length > 0)
        await queryRunner.manager.save(filesToSaveSave);

      if (JSON.parse(input.deleteFileIds).length > 0) {
        const fileResources = await this.fileResourceRepository.find({
          where: {
            fileResourceId: In(JSON.parse(input.deleteFileIds)),
            studentAssignment: {
              stdAsmId: studentAssignment.stdAsmId
            }
          }
        });

        if (!!fileResources && fileResources.length > 0) {
          await queryRunner.manager.delete(FileResource, fileResources);
        }

        for (const fileResource of fileResources) {
          try {

            const directoryPath = path.resolve(Constant.PUBLIC_PATH + fileResource.fileResourcePath);
            fs.accessSync(directoryPath, fs.constants.F_OK);
            fs.unlinkSync(directoryPath);

          } catch (error) {

            if (error.code === "ENOENT") {
              console.error("file not found. : " + fileResource.fileResourcePath);
            } else {
              console.error(error.message);
            }
          }
        }
      }

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(e);
    } finally {
      await queryRunner.release();
    }
  }

  async updateMyAssignments(user: User) {

    try {

      const stdAsms: StudentAssignment[] = Array<StudentAssignment>();

      const assignments = await this.assignmentRepository.find({ where: { room: { students: { user: user } } } });

      if (assignments.length == 0) throw new Error("ไม่มีรายการให้อัพเดท");

      const student = await this.studentRepository.findOne({ where: { user: user } });

      for (const assignment of assignments) {
        const exist = await this.repository.exist({ where: { assignment: assignment, student: { user: user } } });

        if (!exist) {
          const stdAsm = new StudentAssignment();
          stdAsm.assignment = assignment;
          stdAsm.student = student;
          stdAsms.push(stdAsm);
        }
      }

      if (stdAsms.length == 0) throw new Error("ไม่มีรายการให้อัพเดท");

      await this.repository.save(stdAsms);

    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findStudent(assignmentId: number) {
    try {

      const assignment = await this.assignmentRepository.findOne({
        where: {
          assignmentId: assignmentId
        }
      });

      if (!assignment) throw new NotFoundException("ไม่พบข้อมูล แบบฝึกหัด");

      return await this.repository.createQueryBuilder("stdAsm")
        .innerJoin("stdAsm.assignment", "assignment")
        .innerJoin("stdAsm.student", "student")
        .innerJoin("student.user", "user")
        .select(["stdAsm.stdAsmId", "stdAsm.stdAsmGroup", "student.studentId", "user.nameTH", "user.nameEN", "user.studentNo"])
        .where("assignment.assignmentId = :assignmentId", { assignmentId: assignmentId })
        .orderBy("IF(stdAsm.stdAsmGroup IS NULL, 99999999999, stdAsm.stdAsmGroup)", "ASC")
        .addOrderBy("user.studentNo", "ASC")
        .getMany();
    } catch (e) {
      throw new BadRequestException("ไม่สามารถดึงข้อมูลได้ : " + e.message);
    }
  }

  /*------------------- SUB FUNCTION -------------------*/


  async findOne(user: User, assignmentId: number) {
    try {

      const stdAsm = await this.repository.createQueryBuilder("stdAsm")
        .innerJoin("stdAsm.assignment", "assignment")
        .innerJoin("stdAsm.student", "student")
        .innerJoin("student.user", "user")
        .leftJoin("stdAsm.fileResources", "fileResource")
        .where("assignment.assignmentId = :assignmentId", { assignmentId: assignmentId })
        .andWhere("user.userId = :userId", user)
        .select(["stdAsm", "fileResource"])
        .getOne();

      if (!stdAsm) throw new NotFoundException("ไม่พบข้อมูล แบบฝึกหัด");
      return stdAsm;
    } catch (e) {
      throw e;
    }

  }

  async cancelSendAssignment(user: User, stdAsmId: number) {

    try {

      const stdAsm = await this.repository.findOne({
        relations: ["fileResources"],
        where: {
          stdAsmId: stdAsmId,
          student: {
            user: {
              userId: user.userId
            }
          }
        }
      });
      if (!stdAsm) throw new BadRequestException("ไม่พบข้อมูล แบบฝึกหัด");

      stdAsm.stdAsmStatus = stdAsmStatus.WAITING;
      stdAsm.stdAsmResult = null;
      stdAsm.stdAsmDateTime = null;

      await this.repository.save(stdAsm);

      if (!!stdAsm.fileResources && stdAsm.fileResources.length > 0) {
        await this.fileResourceRepository.remove(stdAsm.fileResources);
      }
    } catch (e) {
      throw e;
    }

  }
}
