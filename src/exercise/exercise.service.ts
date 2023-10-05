import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateExercise } from "./dto/create-exercise";
import { AppUtils } from "../utils/app.utils";
import { Constant } from "../utils/constant";
import { createWriteStream } from "fs";
import { Exercise } from "./entities/exercise.entity";
import { ExerciseStatus } from "./dto/exercise-status.enum";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Room } from "../room/entities/room.entity";
import { FileResource } from "../file-resource/entities/file-resource.entity";
import { FileResourceType } from "../file-resource/entities/file-resource-type.enum";
import { FileResult } from "../file-resource/dto/file-result";

@Injectable()
export class ExerciseService {
  constructor(
    @InjectRepository(Exercise)
    private readonly repository: Repository<Exercise>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private dataSource: DataSource
  ) {
  }

  async create(files: Array<Express.Multer.File>, input: CreateExercise) {
    const fileResponses: FileResult[] = [];
    let saveFile = true;
    let msgFileError = "";
    let listFile: Express.Multer.File[] = null;

    //todo : validate input
    this.validateInput(input);

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

          createWriteStream(destinationPath).write(listFileElement.buffer);
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

  private validateInput(input: CreateExercise) {
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

    if (!input.roomId) {
      errors.push("roomId");
    }

    if (errors.length > 0) {
      throw new BadRequestException("กรุณาระบุ : " + errors.join(", "));
    }
  }
}