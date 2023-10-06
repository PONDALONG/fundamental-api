export class AppUtils {
  // public findDir(dir: string): string {
  //   switch (dir) {
  //     case Constant.EXERCISE_KEY:
  //       return Constant.UPLOAD_PATH_EXERCISE;
  //     case Constant.STUDENT_EXERCISE_KEY:
  //       return Constant.UPLOAD_PATH_STUDENT_EXERCISE;
  //     case Constant.PROFILE_KEY:
  //       return Constant.UPLOAD_PATH_PROFILE;
  //     default:
  //       throw new BadRequestException("File not found");
  //   }
  // }

  generateRandomString(length: number): string {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      randomString += charset.charAt(randomIndex);
    }

    return randomString;
  }

  mapPathFile(dir: string, from: string, to: string) {
    return "/" + dir.replace(from, to);
  }

  mapPathFileToDir(dir: string, from: string, to: string) {
    return dir.replace(from, to);
  }
}