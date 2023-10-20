import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { AppUtils } from "../utils/app.utils";
import { Constant } from "../utils/constant";
import { Assignment } from "./entities/assignment.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, Repository } from "typeorm";
import { Room } from "../room/entities/room.entity";
import { FileResource } from "../file-resource/entities/file-resource.entity";
import { FileResourceType } from "../file-resource/entities/file-resource-type.enum";
import { FileResult } from "../file-resource/dto/file-resource.model";
import * as fs from "fs";
import * as path from "path";
import { StudentService } from "../student/student.service";
import { StudentAssignmentService } from "../student-assignment/student-assignment.service";
import { CreateAssignment, UpdateAssignment } from "./dto/assignment.model";
import { User } from "../user/entities/user.entity";
import { FileResourceService } from "../file-resource/file-resource.service";

@Injectable()
export class AssignmentService {

  constructor(
    @InjectRepository(Assignment) private readonly repository: Repository<Assignment>,
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    @InjectRepository(FileResource) private readonly fileResourceRepository: Repository<FileResource>,
    private dataSource: DataSource,
    private readonly studentRoomService: StudentService,
    private readonly assignmentService: StudentAssignmentService,
    private readonly fileResourceService: FileResourceService
  ) {
  }

  /*------------------- MAIN FUNCTION -------------------*/

  async create(files: Array<Express.Multer.File>, input: CreateAssignment) {
    const fileResponses: FileResult[] = [];
    let saveFile = true;
    let msgFileError = "";
    let listFile: Express.Multer.File[] = null;

    // validate input
    // this.validateCreateInput(input);

    const room = await this.roomRepository.findOne({
      where: {
        roomId: input.roomId
      }
    });

    if (!room) throw new BadRequestException("ไม่พบห้องเรียนที่ระบุ");

    if (!!files["files"]) {

      listFile = files["files"];
      for (const listFileElement of listFile) {

        try {
          const fileType = "." + listFileElement.originalname.split(".").pop();
          const random = new AppUtils().generateRandomString(5);
          let fileName = listFileElement.originalname.replace(fileType, "-" + random + fileType);
          const destinationPath = `${Constant.UPLOAD_PATH_ASSIGNMENT}/${fileName}`;

          fs.createWriteStream(path.resolve(Constant.PUBLIC_PATH + destinationPath)).write(listFileElement.buffer);
          fileResponses.push(new FileResult(listFileElement.originalname, destinationPath));

        } catch (error) {
          saveFile = false;
          msgFileError = error.message;
          break;
        }
      }
    }
    //check save file
    if (!saveFile) throw new BadRequestException("บันทึกไฟล์ไม่สำเร็จ : " + msgFileError);

    // save assignment
    const assignment = new Assignment();
    assignment.assignmentName = input.assignmentName.trim();
    assignment.assignmentDescription = input.assignmentDescription.trim();
    assignment.assignmentScore = input.assignmentScore;
    assignment.assignmentStatus = input.assignmentStatus;
    assignment.assignmentEndDate = input.assignmentEndDate;
    assignment.assignmentType = input.assignmentType;
    assignment.room = room;

    const db = this.dataSource.createQueryRunner();
    await db.connect();
    await db.startTransaction();

    try {
      const assignmentSave = await db.manager.save(assignment);

      for (const i of fileResponses) {
        const fileResource = new FileResource();
        fileResource.fileResourceName = i.fileName;
        fileResource.fileResourcePath = i.filePath;
        fileResource.assignment = assignmentSave;
        fileResource.fileResourceType = FileResourceType.ASSIGNMENT;
        await db.manager.save(fileResource);
      }
      const studentRooms = await this.studentRoomService.findAllByRom(room);
      const studentAssignments = this.assignmentService.autoGenerate(assignmentSave, studentRooms);

      await db.manager.save(studentAssignments);

      await db.commitTransaction();
      return { assignmentId: assignmentSave.assignmentId, message: "บันทึกข้อมูลสำเร็จ" };
    } catch (err) {
      await db.rollbackTransaction();
      throw new BadRequestException("บันทึกข้อมูลไม่สำเร็จ : " + err.message);
    } finally {
      await db.release();
    }

  }

  async update(files: Array<Express.Multer.File>, input: UpdateAssignment) {
    const fileResponses: FileResult[] = [];
    let saveFile = true;
    let msgFileError = "";
    let listFile: Express.Multer.File[] = null;
    const assignment = await this.repository.findOne({
      where: {
        assignmentId: input.assignmentId
      }
    });

    if (!assignment) throw new BadRequestException("ไม่พบข้อมูล");

    if (!!files["files"]) {

      listFile = files["files"];
      for (const listFileElement of listFile) {

        try {
          const fileType = "." + listFileElement.originalname.split(".").pop();
          const random = new AppUtils().generateRandomString(5);
          let fileName = listFileElement.originalname.replace(fileType, "-" + random + fileType);
          const destinationPath = `${Constant.UPLOAD_PATH_ASSIGNMENT}/${fileName}`;

          fs.createWriteStream(path.resolve(Constant.PUBLIC_PATH + destinationPath)).write(listFileElement.buffer);
          fileResponses.push(new FileResult(listFileElement.originalname, destinationPath));

        } catch (error) {
          saveFile = false;
          msgFileError = error.message;
          break;
        }
      }
    }

    //check save file
    if (!saveFile) throw new BadRequestException("บันทึกไฟล์ไม่สำเร็จ : " + msgFileError);

    // save assignment
    assignment.assignmentName = input.assignmentName.trim();
    assignment.assignmentDescription = input.assignmentDescription.trim();
    assignment.assignmentScore = input.assignmentScore;
    assignment.assignmentStatus = input.assignmentStatus;
    assignment.assignmentEndDate = input.assignmentEndDate;
    assignment.assignmentType = input.assignmentType;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const assignmentSave = await queryRunner.manager.save(assignment);

      for (const i of fileResponses) {
        const fileResource = new FileResource();
        fileResource.fileResourceName = i.fileName;
        fileResource.fileResourcePath = i.filePath;
        fileResource.assignment = assignmentSave;
        fileResource.fileResourceType = FileResourceType.ASSIGNMENT;
        await queryRunner.manager.save(fileResource);
      }

      if (input.deleteFileIds && JSON.parse(input.deleteFileIds).length > 0) {
        const fileResources = await this.fileResourceRepository.find({
          where: {
            fileResourceId: In(JSON.parse(input.deleteFileIds)),
            assignment: {
              assignmentId: assignment.assignmentId
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
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException("บันทึกข้อมูลไม่สำเร็จ : " + err.message);
    } finally {
      await queryRunner.release();
    }

  }

  async findAll(roomYear: number, roomGroup: string, roomTerm: number) {

    let result: Assignment[] = [];

    try {
      roomYear = roomYear || 0;
      roomTerm = roomTerm || 0;
      roomGroup = roomGroup || "";

      result = await this.repository.createQueryBuilder("assignment")
        .innerJoin("assignment.room", "rm")
        .leftJoinAndSelect("assignment.fileResources", "file")
        .where("rm.roomYear = :roomYear AND rm.roomGroup = :roomGroup AND rm.roomTerm = :roomTerm",
          { roomYear, roomGroup, roomTerm }
        )
        .select(["assignment.assignmentId",
          "assignment.assignmentName",
          "assignment.assignmentScore",
          "assignment.assignmentStatus",
          "assignment.assignmentType",
          "assignment.assignmentStartDate",
          "assignment.assignmentEndDate",
          "file", "rm.roomId", "rm.roomGroup", "rm.roomYear", "rm.roomTerm"])
        .getMany();
    } catch (e) {
      throw new BadRequestException(e.message);
    }

    return result;
  }

  async find(assignmentId: number) {

    try {
      const assignment = await this.repository.findOne({
        relations: ["fileResources"],
        where: {
          assignmentId: assignmentId
        }
      });
      if (!assignment) throw new NotFoundException("ไม่พบข้อมูล");

      return assignment;

    } catch (e) {
      throw e;
    }
  }

  async findMyAssignments(user: User) {
    try {
      return await this.repository.createQueryBuilder("assignment")
        .innerJoin("assignment.room", "rm")
        .innerJoin("rm.students", "student")
        .innerJoin("student.user", "user")
        .innerJoin("assignment.studentAssignments", "stdAsm")
        .where("user.userId = :userId", user)
        .select([
          "assignment.assignmentId",
          "assignment.assignmentName",
          "assignment.assignmentScore",
          "assignment.assignmentStatus",
          "assignment.assignmentType",
          "assignment.assignmentStartDate",
          "assignment.assignmentEndDate"
        ])
        .getMany();
    } catch (e) {
      throw e;
    }
  }

  async delete(assignmentId: number) {
    try {
      const assignment = await this.repository.findOne({
        relations: ["fileResources"],
        where: {
          assignmentId: assignmentId
        }
      });
      await this.repository.delete(assignment);

      for (const fileResource of assignment.fileResources) {
        await this.fileResourceService.delete(fileResource.fileResourceId);
      }
    } catch (e) {
      throw new BadRequestException("ไม่สามารถลบข้อมูลได้ : " + e.message);
    }
  }

  /*------------------- SUB FUNCTION -------------------*/

}