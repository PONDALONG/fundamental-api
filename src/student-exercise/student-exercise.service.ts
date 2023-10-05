import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { StudentExercise } from "./entities/student-exercise.entity";
import { Repository } from "typeorm";
import { Exercise } from "../exercise/entities/exercise.entity";
import { CreateExercise } from "../exercise/dto/create-exercise";
import { AppUtils } from "../utils/app.utils";
import { Constant } from "../utils/constant";
import { createWriteStream } from "fs";
import { ExerciseStatus } from "../exercise/dto/exercise-status.enum";

@Injectable()
export class StudentExerciseService {
  constructor(
    @InjectRepository(StudentExercise)
    private readonly studentExerciseRepository: Repository<StudentExercise>,
    @InjectRepository(StudentExercise)
    private readonly repository: Repository<Exercise>
  ) {
  }

  async create(files: Array<Express.Multer.File>, input: CreateExercise) {
    const listFilename: string[] = [];
    let saveFile = true;
    let msgFileError = "";
    let listFile: Express.Multer.File[] = null;

    //todo : validate input
    this.validateInput(input);

    if (!!files["files"]) {

      listFile = files["files"];
      for (const listFileElement of listFile) {

        try {
          const fileType = "." + listFileElement.originalname.split(".").pop();
          const random = new AppUtils().generateRandomString(5);
          let fileName = listFileElement.originalname.replace(fileType, "-" + random + fileType);
          const destinationPath = `${Constant.UPLOAD_PATH_EXERCISE}/${fileName}`;

          createWriteStream(destinationPath).write(listFileElement.buffer);
          listFilename.push(new AppUtils().mapPathFile(destinationPath, Constant.UPLOAD_PATH_EXERCISE, Constant.EXERCISE_KEY));
        } catch (error) {
          saveFile = false;
          msgFileError = error.message;
          break;
        }
      }
    }
    //check save file
    if (!saveFile) throw new BadRequestException("บันทึกไฟล์ไม่สำเร็จ : " + msgFileError);

    //todo : save exercise
    const exercise = new Exercise();
    exercise.exerciseName = input.exerciseName;
    exercise.exerciseDescription = input.exerciseDescription;
    exercise.exerciseScore = input.exerciseScore;
    exercise.exerciseStatus = input.exerciseStatus === ExerciseStatus.OPEN ? ExerciseStatus.OPEN : null;
    exercise.exerciseStartDate = input.exerciseStartDate;
    exercise.exerciseEndDate = input.exerciseEndDate;
  }

  private validateInput(input: CreateExercise) {
    const errors: string[] = [];

    if (!input.exerciseName || input.exerciseName.trim() == "") {
      errors.push("exerciseName");
    }

    if (!input.exerciseDescription || input.exerciseDescription.trim() == "") {
      errors.push("exerciseDescription");
    }

    if (!input.exerciseScore || input.exerciseScore.trim() == "") {
      errors.push("exerciseScore");
    }

    if (errors.length > 0) {
      throw new Error("กรุณาระบุ : " + errors.join(", "));
    }
  }
}
