import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Request, UseGuards } from "@nestjs/common";
import { RoomCreate } from "./dto/room.model";
import { RoomService } from "./room.service";
import { Res } from "../utils/Res";
import { AdminGuard } from "../auth/admin.guard";
import { AuthGuard } from "../auth/auth.guard";
import { User } from "../user/entities/user.entity";

@Controller("room")
export class RoomController {
  private readonly response = new Res();

  constructor(
    private readonly service: RoomService
  ) {
  }

  @UseGuards(AdminGuard)
  @Post("create")
  @HttpCode(HttpStatus.OK)
  async create(@Body() input: RoomCreate, @Request() auth: any) {
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
  @Get("find-by-student")
  @HttpCode(HttpStatus.OK)
  async findByStudent(@Request() auth: any) {
    try {
      return await this.service.findByStudent(auth["user"] as User);
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(AdminGuard)
  @Get("filterGroups")
  @HttpCode(HttpStatus.OK)
  async filterGroup() {
    try {
      return await this.service.findAllGroup();
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(AdminGuard)
  @Get("filterYears")
  @HttpCode(HttpStatus.OK)
  async filterYearByGroup(@Query("group") group: string) {
    try {
      return await this.service.findAllYearByGroup(group);
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(AdminGuard)
  @Get("filterTerms")
  @HttpCode(HttpStatus.OK)
  async filterTermByGroupAndYear(@Query("group") group: string, @Query("year") year: number) {
    try {
      return await this.service.findAllTermByGroupAndYear(group, year);
    } catch (e) {
      throw e;
    }
  }
}