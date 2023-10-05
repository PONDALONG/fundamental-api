import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateExercise } from "./dto/create-exercise";
import { AppUtils } from "../utils/app.utils";
import { Constant } from "../utils/constant";
import { Exercise } from "./entities/exercise.entity";
import { ExerciseStatus } from "./dto/exercise-status.enum";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, Repository } from "typeorm";
import { Room } from "../room/entities/room.entity";
import { FileResource } from "../file-resource/entities/file-resource.entity";
import { FileResourceType } from "../file-resource/entities/file-resource-type.enum";
import { FileResult } from "../file-resource/dto/file-result";
import { UpdateExercise } from "./dto/update-exercise";
import * as fs from "fs";

@Injectable()
export class ExerciseService {
  constructor(
    @InjectRepository(Exercise)
    private readonly repository: Repository<Exercise>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(FileResource)
    private readonly fileResourceRepository: Repository<FileResource>,
    private dataSource: DataSource
  ) {
  }

  async create(files: Array<Express.Multer.File>, input: CreateExercise) {
    const fileResponses: FileResult[] = [];
    let saveFile = true;
    let msgFileError = "";
    let listFile: Express.Multer.File[] = null;

    // validate input
    this.validateCreateInput(input);

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

          fs.createWriteStream(destinationPath).write(listFileElement.buffer);
          fileResponses.push(new FileResult(listFileElement.originalname, new AppUtils().mapPathFile(destinationPath, Constant.UPLOAD_PATH_EXERCISE, Constant.EXERCISE_KEY)));

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
    exercise.exerciseName = input.exerciseName;
    exercise.exerciseDescription = input.exerciseDescription;
    exercise.exerciseScore = input.exerciseScore;
    exercise.exerciseStatus = input.exerciseStatus === ExerciseStatus.OPEN ? ExerciseStatus.OPEN : ExerciseStatus.CLOSE;
    exercise.exerciseStartDate = input.exerciseStartDate;
    exercise.exerciseEndDate = input.exerciseEndDate;
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

      await db.commitTransaction();
    } catch (err) {
      await db.rollbackTransaction();
      throw new BadRequestException("บันทึกข้อมูลไม่สำเร็จ : " + err.message);
    } finally {
      await db.release();
    }

  }

  async update(files: Array<Express.Multer.File>, input: UpdateExercise) {
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
    this.validateUpdateInput(input);

    if (!!files["files"]) {

      listFile = files["files"];
      for (const listFileElement of listFile) {

        try {
          const fileType = "." + listFileElement.originalname.split(".").pop();
          const random = new AppUtils().generateRandomString(5);
          let fileName = listFileElement.originalname.replace(fileType, "-" + random + fileType);
          const destinationPath = `${Constant.UPLOAD_PATH_EXERCISE}/${fileName}`;

          fs.createWriteStream(destinationPath).write(listFileElement.buffer);
          fileResponses.push(new FileResult(listFileElement.originalname, new AppUtils().mapPathFile(destinationPath, Constant.UPLOAD_PATH_EXERCISE, Constant.EXERCISE_KEY)));

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
    exercise.exerciseName = input.exerciseName;
    exercise.exerciseDescription = input.exerciseDescription;
    exercise.exerciseScore = input.exerciseScore;
    exercise.exerciseStatus = input.exerciseStatus === ExerciseStatus.OPEN ? ExerciseStatus.OPEN : ExerciseStatus.CLOSE;
    exercise.exerciseStartDate = input.exerciseStartDate;
    exercise.exerciseEndDate = input.exerciseEndDate;

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

      if (!!input.deleteFileIds) {
        const strings = input.deleteFileIds.toString().split(",");
        const fileResources = await this.fileResourceRepository.find({
          where: {
            fileResourceId: In(strings),
            exercise: exerciseSave
          }
        });

        if (!!fileResources && fileResources.length > 0) {
          await queryRunner.manager.delete(FileResource, fileResources);
        }

        for (const fileResource of fileResources) {
          try {

            const directoryPath = new AppUtils().mapPathFileToDir(fileResource.fileResourcePath, "/" + Constant.EXERCISE_KEY, Constant.UPLOAD_PATH_EXERCISE);
            fs.accessSync(directoryPath, fs.constants.F_OK);
            fs.unlinkSync(directoryPath);

          } catch (error) {
            // ignore
            if (error.code === "ENOENT")
              console.error(error.message);
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

  private validateCreateInput(input: CreateExercise) {
    const errors: string[] = [];

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

    if (!input.roomId) {
      errors.push("roomId");
    }

    if (errors.length > 0) {
      throw new BadRequestException("กรุณาระบุ : " + errors.join(", "));
    }
  }

  private validateUpdateInput(input: UpdateExercise) {
    const errors: string[] = [];

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

    if (errors.length > 0) {
      throw new BadRequestException("กรุณาระบุ : " + errors.join(", "));
    }
  }
}