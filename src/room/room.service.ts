import { BadRequestException, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Room } from "./entities/room.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../user/entities/user.entity";
import { RoomStatus } from "./dto/room.enum";
import { StudentStatus } from "../student/dto/student.enum";
import { RoomCreate } from "./dto/room.model";

@Injectable()
export class RoomService {

  constructor(
    @InjectRepository(Room)
    private readonly repository: Repository<Room>
  ) {
  }

  async create(input: RoomCreate) {
    try {
      this.validateRoom(input);
      await this.checkDuplicateRoom(input);
      const room = new Room();
      room.roomDescription = input.roomDescription.trim();
      room.roomYear = input.roomYear;
      room.roomGroup = input.roomGroup.trim();
      room.roomTerm = input.roomTerm;
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

  async checkDuplicateRoom(input: RoomCreate) {
    try {
      const room = await this.repository.findOne({
        where: {
          roomYear: input.roomYear,
          roomGroup: input.roomGroup.trim(),
          roomTerm: input.roomTerm
        }
      });
      if (room) throw new BadRequestException("มีข้อมูลชื่อห้องเรียนนี้แล้ว");
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

  /*------------------- SUB FUNCTION -------------------*/

  private validateRoom(data: RoomCreate) {
    const errors: string[] = [];
    if (!data.roomDescription || data.roomDescription.trim() == "") {
      errors.push("roomDescription");
    }
    if (!data.roomYear) {
      errors.push("roomYear");
    }
    if (!data.roomGroup || data.roomGroup.trim() == "") {
      errors.push("roomGroup");
    }
    if (!data.roomTerm) {
      errors.push("roomTerm");
    }
    if (errors.length > 0) {
      throw new BadRequestException("กรุณาระบุ : " + errors.join(", "));
    }

  }
}