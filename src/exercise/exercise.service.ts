import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateExerciseRequest } from "./dto/create-exercise-request";
import { AppUtils } from "../utils/app.utils";
import { Constant } from "../utils/constant";
import { Exercise } from "./entities/exercise.entity";
import { ExerciseStatus, ExerciseType } from "./dto/exercise.enum";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, Repository } from "typeorm";
import { Room } from "../room/entities/room.entity";
import { FileResource } from "../file-resource/entities/file-resource.entity";
import { FileResourceType } from "../file-resource/entities/file-resource-type.enum";
import { FileResult } from "../file-resource/dto/file-result";
import { UpdateExerciseRequest } from "./dto/update-exercise-request";
import * as fs from "fs";
import * as path from "path";
import { StudentRoomService } from "../student-room/student-room.service";
import { StudentExerciseService } from "../student-exercise/student-exercise.service";

@Injectable()
export class ExerciseService {

  constructor(
    @InjectRepository(Exercise) private readonly repository: Repository<Exercise>,
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    @InjectRepository(FileResource) private readonly fileResourceRepository: Repository<FileResource>,
    private dataSource: DataSource,
    private readonly studentRoomService: StudentRoomService,
    private readonly studentExerciseService: StudentExerciseService
  ) {
  }

  /*------------------- MAIN FUNCTION -------------------*/

  async create(files: Array<Express.Multer.File>, input: CreateExerciseRequest) {
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
          const destinationPath = `${Constant.UPLOAD_PATH_EXERCISE}/${fileName}`;

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

    // save exercise
    const exercise = new Exercise();
    exercise.exerciseName = input.exerciseName.trim();
    exercise.exerciseDescription = input.exerciseDescription.trim();
    exercise.exerciseScore = input.exerciseScore;
    exercise.exerciseStatus = input.exerciseStatus;
    exercise.exerciseEndDate = input.exerciseEndDate;
    exercise.exerciseType = input.exerciseType;
    exercise.room = room;

    const db = this.dataSource.createQueryRunner();
    await db.connect();
    await db.startTransaction();

    try {
      const exerciseSave = await db.manager.save(exercise);

      for (const i of fileResponses) {
        const fileResource = new FileResource();
        fileResource.fileResourceName = i.fileName;
        fileResource.fileResourcePath = i.filePath;
        fileResource.exercise = exerciseSave;
        fileResource.fileResourceType = FileResourceType.EXERCISE;
        await db.manager.save(fileResource);
      }
      const studentRooms = await this.studentRoomService.findAllByRom(room);
      const studentExercises = this.studentExerciseService.autoGenerate(exerciseSave, studentRooms);

      await db.manager.save(studentExercises);

      await db.commitTransaction();
    } catch (err) {
      await db.rollbackTransaction();
      throw new BadRequestException("บันทึกข้อมูลไม่สำเร็จ : " + err.message);
    } finally {
      await db.release();
    }

  }

  async update(files: Array<Express.Multer.File>, input: UpdateExerciseRequest) {
    const fileResponses: FileResult[] = [];
    let saveFile = true;
    let msgFileError = "";
    let listFile: Express.Multer.File[] = null;
    const exercise = await this.repository.findOne({
      where: {
        exerciseId: input.exerciseId
      }
    });

    if (!exercise) throw new BadRequestException("ไม่พบข้อมูล");

    // validate input
    // this.validateUpdateInput(input);

    if (!!files["files"]) {

      listFile = files["files"];
      for (const listFileElement of listFile) {

        try {
          const fileType = "." + listFileElement.originalname.split(".").pop();
          const random = new AppUtils().generateRandomString(5);
          let fileName = listFileElement.originalname.replace(fileType, "-" + random + fileType);
          const destinationPath = `${Constant.UPLOAD_PATH_EXERCISE}/${fileName}`;

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

    // save exercise
    exercise.exerciseName = input.exerciseName.trim();
    exercise.exerciseDescription = input.exerciseDescription.trim();
    exercise.exerciseScore = input.exerciseScore;
    exercise.exerciseStatus = input.exerciseStatus;
    exercise.exerciseEndDate = input.exerciseEndDate;
    exercise.exerciseType = input.exerciseType;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const exerciseSave = await queryRunner.manager.save(exercise);

      for (const i of fileResponses) {
        const fileResource = new FileResource();
        fileResource.fileResourceName = i.fileName;
        fileResource.fileResourcePath = i.filePath;
        fileResource.exercise = exerciseSave;
        fileResource.fileResourceType = FileResourceType.EXERCISE;
        await queryRunner.manager.save(fileResource);
      }

      if (JSON.parse(input.deleteFileIds).length > 0) {
        const fileResources = await this.fileResourceRepository.find({
          where: {
            fileResourceId: In(JSON.parse(input.deleteFileIds)),
            exercise: {
              exerciseId: exercise.exerciseId
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

    let result: Exercise[] = [];

    try {
      roomYear = roomYear || 0;
      roomTerm = roomTerm || 0;
      roomGroup = roomGroup || "";

      result = await this.repository.createQueryBuilder("exercise")
        .innerJoin("exercise.room", "rm")
        .leftJoinAndSelect("exercise.fileResources", "file")
        .where("rm.roomYear = :roomYear AND rm.roomGroup = :roomGroup AND rm.roomTerm = :roomTerm",
          { roomYear, roomGroup, roomTerm }
        )
        .select(["exercise", "file", "rm.roomId", "rm.roomGroup", "rm.roomYear", "rm.roomTerm"])
        .getMany();
    } catch (e) {
      throw new BadRequestException(e.message);
    }

    return result;
  }


  /*------------------- SUB FUNCTION -------------------*/

  private validateCreateInput(input: CreateExerciseRequest) {
    let errors: string[] = [];
    const msgErrors: string[] = [];

    if (!input.exerciseName || input.exerciseName.trim() == "") {
      errors.push("exerciseName");
    }

    if (!input.exerciseDescription || input.exerciseDescription.trim() == "") {
      errors.push("exerciseDescription");
    }

    if (!input.exerciseScore) {
      errors.push("exerciseScore");
    }

    if (!input.exerciseStatus || input.exerciseStatus.trim() == "") {
      errors.push("exerciseStatus");
    }

    if (!input.exerciseType || input.exerciseType.trim() == "") {
      errors.push("exerciseType");
    }

    if (!input.roomId) {
      errors.push("roomId");
    }

    if (errors.length > 0) {
      msgErrors.push("กรุณาระบุ : " + errors.join(", "));
      errors = [];
    }

    if (!!input.exerciseType && input.exerciseType.trim() != "") {
      if (!Object.values(ExerciseType).includes(input.exerciseType)) {
        errors.push("exerciseType");
      }
    }

    if (!!input.exerciseStatus && input.exerciseStatus.trim() != "") {
      if (!Object.values(ExerciseStatus).includes(input.exerciseStatus)) {
        errors.push("exerciseStatus");
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

  private validateUpdateInput(input: UpdateExerciseRequest) {
    let errors: string[] = [];
    const msgErrors: string[] = [];
    if (!input.exerciseId) {
      errors.push("exerciseId");
    }

    if (!input.exerciseName || input.exerciseName.trim() == "") {
      errors.push("exerciseName");
    }

    if (!input.exerciseDescription || input.exerciseDescription.trim() == "") {
      errors.push("exerciseDescription");
    }

    if (!input.exerciseScore) {
      errors.push("exerciseScore");
    }

    if (!input.exerciseStatus || input.exerciseStatus.trim() == "") {
      errors.push("exerciseStatus");
    }

    if (!input.exerciseType || input.exerciseType.trim() == "") {
      errors.push("exerciseType");
    }

    if (errors.length > 0) {
      msgErrors.push("กรุณาระบุ : " + errors.join(", "));
      errors = [];
    }

    if (!!input.exerciseType && input.exerciseType.trim() != "") {
      if (!Object.values(ExerciseType).includes(input.exerciseType)) {
        errors.push("exerciseType");
      }
    }

    if (!!input.exerciseStatus && input.exerciseStatus.trim() != "") {
      if (!Object.values(ExerciseStatus).includes(input.exerciseStatus)) {
        errors.push("exerciseStatus");
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