import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
  Res,
  UseGuards
} from "@nestjs/common";
import { RoomCreate, RoomUpdate } from "./dto/room.model";
import { RoomService } from "./room.service";
import { ResP } from "../utils/ResP";
import { AdminGuard } from "../auth/admin.guard";
import { AuthGuard } from "../auth/auth.guard";
import { User } from "../user/entities/user.entity";
import { Response } from "express";

@Controller("room")
export class RoomController {
  private readonly response = new ResP();

  constructor(
    private readonly service: RoomService
  ) {
  }

  @UseGuards(AdminGuard)
  @Post("create")
  @HttpCode(HttpStatus.OK)
  async create(@Body() input: RoomCreate) {
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
  @Get("find")
  @HttpCode(HttpStatus.OK)
  async find(@Query("roomId") roomId: number) {
    try {
      const room = await this.service.findByRoomId(roomId);
      if (!room) throw new BadRequestException("ไม่พบห้องเรียน");
      return room;
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

  @UseGuards(AdminGuard)
  @Get("dropdown-filter")
  @HttpCode(HttpStatus.OK)
  async dropdownFilter() {
    return await this.service.dropdownFilter();
  }

  @UseGuards(AdminGuard)
  @Get("find-filter")
  @HttpCode(HttpStatus.OK)
  async findFilter(@Query("term") term: number, @Query("year") year: number) {
    return await this.service.findFilter(term, year);
  }

  @UseGuards(AdminGuard)
  @Get("find-YGT")
  @HttpCode(HttpStatus.OK)
  async findYGT(
    @Query("roomYear") roomYear: number,
    @Query("roomGroup") roomGroup: string,
    @Query("roomTerm") roomTerm: number
  ) {
    try {
      if (isNaN(+roomYear)) throw new BadRequestException("roomYear ไม่ถูกต้อง");
      if (isNaN(+roomTerm)) throw new BadRequestException("roomTerm ไม่ถูกต้อง");
      return await this.service.findYGT(roomYear, roomGroup, roomTerm);
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(AdminGuard)
  @Post("update")
  @HttpCode(HttpStatus.OK)
  async update(@Body() input: RoomUpdate) {
    try {
      await this.service.update(input);
      return this.response.ok();
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(AdminGuard)
  @Get("report-score-student")
  @HttpCode(HttpStatus.OK)
  async reportScoreStudent(@Query("roomId") roomId: number) {
    try {
      return await this.service.mapReport(roomId);
    } catch (e) {
      throw e;
    }
  }

  // @UseGuards(AdminGuard)
  @Get("export-score-student")
  @HttpCode(HttpStatus.OK)
  async exportScoreStudent(@Res() res: Response, @Query("roomId") roomId: number, @Query("type") type: string) {
    try {
      if (isNaN(+roomId)) throw new BadRequestException("roomId ไม่ถูกต้อง");

      if (type !== "csv" && type !== "excel") throw new BadRequestException("type ไม่ถูกต้อง");

      const result = type !== "csv" ? await this.service.exportReportScoreStudentEXCEL(roomId) : await this.service.exportReportScoreStudentCSV(roomId);

      const contentType = type === "csv" ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      res.setHeader("Content-disposition", "attachment; filename=" + result.filename);
      res.setHeader("Content-Type", contentType);

      res.send(result.file);
    } catch (e) {
      throw e;
    }
  }
}