import { Controller, Delete, HttpCode, HttpStatus, Post, Query, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FileResourceService } from "./file-resource.service";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { createWriteStream } from "fs";

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

  @Delete("delete")
  @HttpCode(HttpStatus.OK)
  async delete(@Query("fileId") fileId: number) {
    await this.service.delete(fileId);
  }

}
