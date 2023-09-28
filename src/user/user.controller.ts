import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { loginRequestDto } from "./dto/login-request.dto";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("user")
export class UserController {
  constructor(
    private readonly service: UserService
  ) {
  }

  @Post("login")
  login(@Body() req: loginRequestDto) {
    return this.service.login(req);
  }

  @Post("imports")
  @UseInterceptors(FileInterceptor("file"))
  async imports(@UploadedFile() file: Express.Multer.File) {
    await this.service.imports(file);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.service.update(+id, updateUserDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(+id);
  }
}
