import { BadRequestException, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Room } from "./entities/room.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../user/entities/user.entity";
import { RoomStatus } from "./dto/room.enum";
import { StudentStatus } from "../student/dto/student.enum";
import { Dropdown, RoomCreate, RoomUpdate } from "./dto/room.model";

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
          studentRooms: {
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
    return await this.repository.createQueryBuilder("room").select(["room.roomGroup"]).groupBy("room.roomGroup").getMany();
  }

  async findAllYearByGroup(roomGroup: string) {
    return await this.repository.createQueryBuilder("room").select(["room.roomYear"]).where("room.roomGroup = :roomGroup", { roomGroup: roomGroup }).groupBy("room.roomYear").getMany();
  }

  async findAllTermByGroupAndYear(roomGroup: string, roomYear: number) {
    return await this.repository.createQueryBuilder("room").select(["room.roomTerm"]).where("room.roomGroup = :roomGroup AND room.roomYear = :roomYear", {
      roomGroup: roomGroup,
      roomYear: roomYear
    }).groupBy("room.roomTerm").getMany();
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

  /*------------------- SUB FUNCTION -------------------*/

}