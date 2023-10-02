import { Controller, Post, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FileResourceService } from "./file-resource.service";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { createWriteStream } from "fs";
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

      // Use fs.promises to save the file
       createWriteStream(destinationPath).write(listFileElement.buffer);

    }
    return true
  }

}
