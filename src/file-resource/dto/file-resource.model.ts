export class fileUpload {
  stdAsmId: number;
  contentId: number;
  assignmentId: number;
}

export class FileResult {
  fileName: string;
  filePath: string;

  constructor(fileName: string, filePath: string) {
    this.fileName = fileName;
    this.filePath = filePath;
  }
}