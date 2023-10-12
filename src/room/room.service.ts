import { BadRequestException, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Room } from "./entities/room.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../user/entities/user.entity";
import { RoomStatus } from "./dto/room.enum";
import { StudentStatus } from "../student/dto/student.enum";
import { Dropdown, RoomCreate, RoomUpdate } from "./dto/room.model";
import * as createCsvStringifier from "csv-writer";

@Injectable()
export class RoomService {

  constructor(
    @InjectRepository(Room)
    private readonly repository: Repository<Room>
  ) {
  }

  async create(input: RoomCreate) {
    try {
      await this.checkDuplicateRoomCreate(input);
      const room = new Room();
      room.roomYear = input.roomYear;
      room.roomGroup = input.roomGroup.trim().toUpperCase();
      room.roomTerm = input.roomTerm;
      room.roomStatus = input.roomStatus;
      try {
        return await this.repository.save(room);
      } catch (e) {
        throw new BadRequestException("บันทึกข้อมูลผิดพลาด : " + e.message);
      }
    } catch (e) {
      throw e;
    }
  }

  async update(input: RoomUpdate) {
    try {
      const room = await this.findByRoomId(input.roomId);

      if (!room) throw new BadRequestException("ไม่พบห้องเรียน");

      await this.checkDuplicateRoomUpdate(input);
      room.roomYear = input.roomYear;
      room.roomGroup = input.roomGroup.trim().toUpperCase();
      room.roomTerm = input.roomTerm;
      room.roomStatus = input.roomStatus;
      try {
        return await this.repository.save(room);
      } catch (e) {
        throw new BadRequestException("บันทึกข้อมูลผิดพลาด : " + e.message);
      }
    } catch (e) {
      throw e;
    }
  }

  /*------------------- MAIN FUNCTION -------------------*/

  async checkDuplicateRoomCreate(input: RoomCreate) {
    try {
      const room = await this.repository.findOne({
        where: {
          roomYear: input.roomYear,
          roomGroup: input.roomGroup.trim().toUpperCase(),
          roomTerm: input.roomTerm
        }
      });
      if (room) throw new BadRequestException("มีข้อมูลชื่อห้องเรียนนี้แล้ว");
    } catch (e) {
      throw e;
    }
  }

  async checkDuplicateRoomUpdate(input: RoomUpdate) {
    try {
      const room = await this.repository.findOne({
        where: {
          roomYear: input.roomYear,
          roomGroup: input.roomGroup.trim().toUpperCase(),
          roomTerm: input.roomTerm
        }
      });

      if (room && room.roomId != input.roomId)
        throw new BadRequestException("มีข้อมูลชื่อห้องเรียนนี้แล้ว");

    } catch (e) {
      throw e;
    }
  }

  async findAll() {
    try {
      const result = await this.repository.find();
      return result;
    } catch (e) {
      throw e;
    }
  }

  async findByRoomId(roomId: number) {
    try {
      const result = await this.repository.findOne({
        where: {
          roomId: roomId
        }
      });
      return result;
    } catch (e) {
      throw e;
    }
  }

  async findByStudent(user: User) {
    return await this.repository.find(
      {
        where: {
          students: {
            studentStatus: StudentStatus.ACTIVE,
            user: {
              userId: user.userId
            }
          },
          roomStatus: RoomStatus.OPEN
        }
      }
    );
  }

  async findAllGroup() {
    return await this.repository.createQueryBuilder("room")
      .select(["room.roomGroup"])
      .addOrderBy("room.roomGroup", "ASC")
      .groupBy("room.roomGroup")
      .getMany();
  }

  async findAllYearByGroup(roomGroup: string) {
    return await this.repository.createQueryBuilder("room")
      .select(["room.roomYear"])
      .where("room.roomGroup = :roomGroup", { roomGroup: roomGroup })
      .addOrderBy("room.roomYear", "ASC")
      .groupBy("room.roomYear")
      .getMany();
  }

  async findAllTermByGroupAndYear(roomGroup: string, roomYear: number) {
    return await this.repository.createQueryBuilder("room")
      .select(["room.roomTerm"])
      .where("room.roomGroup = :roomGroup AND room.roomYear = :roomYear", { roomGroup: roomGroup, roomYear: roomYear })
      .groupBy("room.roomTerm")
      .addOrderBy("room.roomTerm", "ASC")
      .getMany();
  }

  async dropdownFilter() {

    try {

      const roomsYears = await this.repository.createQueryBuilder("room").select(["room.roomYear"]).groupBy("room.roomYear").getMany();
      const roomsTerm = await this.repository.createQueryBuilder("room").select(["room.roomTerm"]).groupBy("room.roomTerm").getMany();

      const dropdown = new Dropdown();

      for (const i of roomsYears) dropdown.years.push(i.roomYear);
      for (const i of roomsTerm) dropdown.terms.push(i.roomTerm);

      return dropdown;
    } catch (e) {
      throw new BadRequestException("ไม่สามารถดึงข้อมูลได้ : " + e.message);
    }
  }

  async findFilter(term: number, year: number) {
    try {
      const result = await this.repository.createQueryBuilder("room")
        .select(["room.roomId", "room.roomGroup", "room.roomYear", "room.roomTerm", "room.roomStatus"])
        .where("room.roomTerm = :term AND room.roomYear = :year", { term: term, year: year })
        .addOrderBy("room.roomGroup", "ASC")
        .getMany();
      return result;
    } catch (e) {
      throw new BadRequestException("ไม่สามารถดึงข้อมูลได้ : " + e.message);
    }
  }

  async reportScoreStudent(roomId: number) {
    const room = await this.repository.createQueryBuilder("rm")
      .leftJoin("rm.assignments", "asm")
      .leftJoin("rm.students", "std")
      .leftJoin("std.user", "user")
      .leftJoin("std.studentAssignments", "stdAsm", "stdAsm.assignment = asm.assignmentId")
      .leftJoin("stdAsm.assignment", "asm2")
      .where("rm.roomId = :roomId", { roomId: roomId })
      .select([
        "rm",
        "asm.assignmentId", "asm.assignmentName", "asm.assignmentScore",
        "std.studentId",
        "user.studentNo", "user.nameTH", "user.nameEN",
        "stdAsm.stdAsmId", "stdAsm.stdAsmScore",
        "asm2.assignmentId", "asm2.assignmentName"
      ])
      .orderBy("user.studentNo", "ASC")
      .orderBy("asm.assignmentId", "ASC")
      .orderBy("stdAsm.assignment.assignmentId", "ASC")
      .getOne();

    if (!room) throw new BadRequestException("ไม่พบข้อมูลห้องเรียน");

    return room;
  }

  async exportReportScoreStudentCSV(roomId: number) {
    const room = await this.reportScoreStudent(roomId);

    /*
    STUDENT_NO	FULLNAME	FULLNAME_EN	LAB1	LAB2	LAB3	LAB4	LAB5	LAB6	LAB7	LAB8	LAB9	LAB10	TOTAL

     */
    const HEADER = [
      { id: "id", title: "STUDENT_NO" },
      { id: "name", title: "FULLNAME" },
      { id: "email", title: "FULLNAME_EN" }
    ];

    for (const assignment of room.assignments) {
      HEADER.push({ id: assignment.assignmentId.toString(), title: assignment.assignmentName });
    }

    HEADER.push({ id: "total", title: "TOTAL" });

    const csvStringifier = createCsvStringifier.createObjectCsvStringifier({ header: HEADER });

    const data = room.students.map((student) => {
      const item = {
        id: student.user.studentNo,
        name: student.user.nameTH,
        email: student.user.nameEN
      };

      let total = 0;
      for (const assignment of student.studentAssignments) {
        item[assignment.assignment.assignmentId.toString()] = assignment.stdAsmScore;
        total += assignment.stdAsmScore;
      }
      item["total"] = total;

      return item;
    });

    const csvData = data.map((item) => csvStringifier.stringifyRecords([item]));
    const csvHeader = csvStringifier.getHeaderString();

    return "\uFEFF" + csvHeader + csvData.join("");
  }

  async exportReportScoreStudentEXCEL(roomId: number){

  }

  /*------------------- SUB FUNCTION -------------------*/

}