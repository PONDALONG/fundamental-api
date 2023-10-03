import { Body, Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FileResourceService } from "./file-resource.service";
import { FileFieldsInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { createWriteStream } from "fs";
import { UploadRequest } from "./dto/upload-request.dto";
import { Constant } from "../utils/constant";

@Controller("file-resource")
export class FileResourceController {
  constructor(private readonly fileResourceService: FileResourceService) {
  }

  @Post("upload")
  @UseInterceptors(FileFieldsInterceptor([
    { name: "files" }
  ]))
  uploadFile(@UploadedFiles() files?: Array<Express.Multer.File>) {
    const listFile: Express.Multer.File[] = files["files"];
    for (const listFileElement of listFile) {
      console.log(listFileElement.originalname);
      const destinationPath = `./uploads/${listFileElement.originalname}`;

      createWriteStream(destinationPath).write(listFileElement.buffer);

    }
    return true;
  }

  @Post("upload-content")
  @UseInterceptors(FileInterceptor("file"))
  uploadContent(@UploadedFile() file?: Express.Multer.File, @Body() data?: UploadRequest) {

    try {
      const destinationPath = `${Constant.UPLOAD_PATH_CONTENT}/${file.originalname.replace(".", "-" + new Date().getTime().toString() + ".")}`;

      createWriteStream(destinationPath).write(file.buffer);

    } catch (error) {
      throw error;
    }
  }

  @Post("upload-exercise")
  @UseInterceptors(FileFieldsInterceptor([
    { name: "files" }
  ]))
  uploadExercise(@UploadedFiles() files?: Array<Express.Multer.File>, @Body() data?: UploadRequest) {

  }

}
