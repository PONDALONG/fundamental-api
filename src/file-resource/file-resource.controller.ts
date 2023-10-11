import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors
} from "@nestjs/common";
import { FileResourceService } from "./file-resource.service";
import { FileFieldsInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { createWriteStream } from "fs";
import * as xlsx from "xlsx";

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


  @Post("upload-xlsx")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFileX(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    try {
      if (file.buffer) {
        // Read the XLSX file from the buffer
        const workbook = xlsx.read(file.buffer, { type: "buffer" });

        // Assuming the XLSX file has a single sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Parse the XLSX data to JSON
        const jsonData = xlsx.utils.sheet_to_json(sheet);


        // Now 'jsonData' contains the data from the XLSX file as JSON
        console.log("XLSX data:", jsonData);
        return jsonData;
      } else {
        console.error("Uploaded file buffer is empty.");
      }
    } catch (error) {
      console.error("Error reading the XLSX file:", error);
    }
  }

}
