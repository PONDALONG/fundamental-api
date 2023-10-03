import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from "@nestjs/common";
import { RoomCreateRequestDto } from "./dto/room-create-request.dto";
import { RoomService } from "./room.service";
import { Res } from "../utils/Res";
import { AdminGuard } from "../auth/admin.guard";
import { AuthGuard } from "../auth/auth.guard";
import { User } from "../user/entities/user.entity";

@Controller("course")
export class RoomController {
  private readonly response = new Res();

  constructor(
    private readonly service: RoomService
  ) {
  }

  @UseGuards(AdminGuard)
  @Post("create")
  @HttpCode(HttpStatus.OK)
  async create(@Body() input: RoomCreateRequestDto, @Request() auth: any) {
    try {
      await this.service.create(input);
      return this.response.ok();
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(AdminGuard)
  @Get("findAll")
  @HttpCode(HttpStatus.OK)
  async findAll() {
    try {
      return await this.service.findAll();
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(AuthGuard)
  @Get("findAllByUser")
  @HttpCode(HttpStatus.OK)
  async findAllByUser(@Request() auth: any) {
    try {
      return await this.service.findAllByUser(auth["user"] as User);
    } catch (e) {
      throw e;
    }
  }
}