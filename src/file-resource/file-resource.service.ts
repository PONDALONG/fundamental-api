import { Injectable } from "@nestjs/common";
import { FileResource } from "./entities/file-resource.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import * as fs from "fs";

@Injectable()
export class FileResourceService {
  constructor(
    @InjectRepository(FileResource)
    private readonly repository: Repository<FileResource>
  ) {
  }

  /*------------------- MAIN FUNCTION -------------------*/

  async delete(fileId: number) {
    try {
      const fileResource = await this.repository.findOne({
        where: {
          fileResourceId: fileId
        }
      });

      if (!fileResource) return;
      const directoryPath = fileResource.fileResourcePath;

      await this.repository.delete({
        fileResourceId: fileId
      });

      fs.accessSync(directoryPath, fs.constants.F_OK);
      fs.unlinkSync(directoryPath);

    } catch (error) {
      if (error.code === "ENOENT") {
        console.error("File not found!");
      }
    }
  }

  /*------------------- SUB FUNCTION -------------------*/

}
