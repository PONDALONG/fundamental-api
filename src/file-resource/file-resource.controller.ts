import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors
} from "@nestjs/common";
import { FileResourceService } from "./file-resource.service";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { createWriteStream } from "fs";
import { UploadRequest } from "./dto/upload-request.dto";
import type { Response } from "express";
import { AppUtils } from "../utils/app.utils";

@Controller("file-resource")
export class FileResourceController {
  constructor(private readonly service: FileResourceService) {
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

  // @Post("upload-content")
  // @UseInterceptors(FileInterceptor("file"))
  // uploadContent(@UploadedFile() file?: Express.Multer.File, @Body() data?: UploadRequest) {
  //
  //   try {
  //     const destinationPath = `${Constant.UPLOAD_PATH_CONTENT}/${file.originalname.replace(".", "-" + new Date().getTime().toString() + ".")}`;
  //
  //     createWriteStream(destinationPath).write(file.buffer);
  //
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  @Post("upload-exercise")
  @UseInterceptors(FileFieldsInterceptor([
    { name: "files" }
  ]))
  uploadExercise(@UploadedFiles() files?: Array<Express.Multer.File>, @Body() data?: UploadRequest) {

  }

  @Get("download/:dir/:fileName")
  download(@Res() res: Response, @Param("fileName") fileName: string, @Param("dir") dir: string) {
    res.sendFile(fileName, { root: new AppUtils().findDir(dir) });
  }

  @Delete("delete")
  @HttpCode(HttpStatus.OK)
  async delete(@Query("fileId") fileId: number) {
    await this.service.delete(fileId);
  }

}
