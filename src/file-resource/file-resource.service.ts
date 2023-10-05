import { BadRequestException, Injectable } from "@nestjs/common";
import { FileResource } from "./entities/file-resource.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import * as fs from "fs";
import { AppUtils } from "../utils/app.utils";
import { Constant } from "../utils/constant";

@Injectable()
export class FileResourceService {
  constructor(
    @InjectRepository(FileResource)
    private readonly repository: Repository<FileResource>
  ) {
  }

  async delete(fileId: number) {
    try {
      const fileResource = await this.repository.findOne({
        where: {
          fileResourceId: fileId
        }
      });

      if (!fileResource) return;
      const directoryPath = new AppUtils().mapPathFileToDir(fileResource.fileResourcePath, "/" + Constant.EXERCISE_KEY, Constant.UPLOAD_PATH_EXERCISE);

      await this.repository.delete({
        fileResourceId: fileId
      });

      fs.accessSync(directoryPath, fs.constants.F_OK);
      fs.unlinkSync(directoryPath);

    } catch (error) {
      if (error.code === "ENOENT") return;
      throw new BadRequestException("ลบไฟล์ผิดพลาด : " + error.message);
    }
  }
}
