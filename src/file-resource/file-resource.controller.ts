import { Controller } from "@nestjs/common";
import { FileResourceService } from "./file-resource.service";

@Controller("file-resource")
export class FileResourceController {
  constructor(private readonly fileResourceService: FileResourceService) {
  }
}
