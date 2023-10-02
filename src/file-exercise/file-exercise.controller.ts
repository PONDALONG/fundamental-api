import { Controller } from "@nestjs/common";
import { FileExerciseService } from "./file-exercise.service";

@Controller("file-exercise")
export class FileExerciseController {
  constructor(private readonly fileExerciseService: FileExerciseService) {
  }
}
