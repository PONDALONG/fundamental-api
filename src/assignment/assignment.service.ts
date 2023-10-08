import { BadRequestException, Injectable } from "@nestjs/common";
import { AppUtils } from "../utils/app.utils";
import { Constant } from "../utils/constant";
import { Assignment } from "./entities/assignment.entity";
import { AssignmentStatus, AssignmentType } from "./dto/assignment.enum";
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

@Injectable()
export class AssignmentService {

  constructor(
    @InjectRepository(Assignment) private readonly repository: Repository<Assignment>,
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    @InjectRepository(FileResource) private readonly fileResourceRepository: Repository<FileResource>,
    private dataSource: DataSource,
    private readonly studentRoomService: StudentService,
    private readonly assignmentService: StudentAssignmentService
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

    // validate input
    // this.validateUpdateInput(input);

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

      if (JSON.parse(input.deleteFileIds).length > 0) {
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
        .select(["assignment", "file", "rm.roomId", "rm.roomGroup", "rm.roomYear", "rm.roomTerm"])
        .getMany();
    } catch (e) {
      throw new BadRequestException(e.message);
    }

    return result;
  }


  /*------------------- SUB FUNCTION -------------------*/

  private validateCreateInput(input: CreateAssignment) {
    let errors: string[] = [];
    const msgErrors: string[] = [];

    if (!input.assignmentName || input.assignmentName.trim() == "") {
      errors.push("assignmentName");
    }

    if (!input.assignmentDescription || input.assignmentDescription.trim() == "") {
      errors.push("assignmentDescription");
    }

    if (!input.assignmentScore) {
      errors.push("assignmentScore");
    }

    if (!input.assignmentStatus || input.assignmentStatus.trim() == "") {
      errors.push("assignmentStatus");
    }

    if (!input.assignmentType || input.assignmentType.trim() == "") {
      errors.push("assignmentType");
    }

    if (!input.roomId) {
      errors.push("roomId");
    }

    if (errors.length > 0) {
      msgErrors.push("กรุณาระบุ : " + errors.join(", "));
      errors = [];
    }

    if (!!input.assignmentType && input.assignmentType.trim() != "") {
      if (!Object.values(AssignmentType).includes(input.assignmentType)) {
        errors.push("assignmentType");
      }
    }

    if (!!input.assignmentStatus && input.assignmentStatus.trim() != "") {
      if (!Object.values(AssignmentStatus).includes(input.assignmentStatus)) {
        errors.push("assignmentStatus");
      }
    }

    if (errors.length > 0) {
      msgErrors.push(errors.join(", ") + " ไม่ถูกต้อง");
      errors = [];
    }

    if (msgErrors.length > 0) {
      throw new BadRequestException(msgErrors.join(" | "));
    }
  }

  private validateUpdateInput(input: UpdateAssignment) {
    let errors: string[] = [];
    const msgErrors: string[] = [];
    if (!input.assignmentId) {
      errors.push("assignmentId");
    }

    if (!input.assignmentName || input.assignmentName.trim() == "") {
      errors.push("assignmentName");
    }

    if (!input.assignmentDescription || input.assignmentDescription.trim() == "") {
      errors.push("assignmentDescription");
    }

    if (!input.assignmentScore) {
      errors.push("assignmentScore");
    }

    if (!input.assignmentStatus || input.assignmentStatus.trim() == "") {
      errors.push("assignmentStatus");
    }

    if (!input.assignmentType || input.assignmentType.trim() == "") {
      errors.push("assignmentType");
    }

    if (errors.length > 0) {
      msgErrors.push("กรุณาระบุ : " + errors.join(", "));
      errors = [];
    }

    if (!!input.assignmentType && input.assignmentType.trim() != "") {
      if (!Object.values(AssignmentType).includes(input.assignmentType)) {
        errors.push("assignmentType");
      }
    }

    if (!!input.assignmentStatus && input.assignmentStatus.trim() != "") {
      if (!Object.values(AssignmentStatus).includes(input.assignmentStatus)) {
        errors.push("assignmentStatus");
      }
    }

    if (errors.length > 0) {
      msgErrors.push(errors.join(", ") + " ไม่ถูกต้อง");
      errors = [];
    }

    if (msgErrors.length > 0) {
      throw new BadRequestException(msgErrors.join(" | "));
    }
  }
}