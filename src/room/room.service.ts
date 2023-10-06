import { BadRequestException, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Room } from "./entities/room.entity";
import { RoomCreateRequestDto } from "./dto/room-create-request.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../user/entities/user.entity";
import { StdRoomStatus } from "../student-room/entities/std-room-status.enum";
import { RoomStatus } from "./dto/room-status.enum";

@Injectable()
export class RoomService {

  constructor(
    @InjectRepository(Room)
    private readonly repository: Repository<Room>
  ) {
  }

  async create(input: RoomCreateRequestDto) {
    try {
      this.validateRoom(input);
      await this.checkDuplicateRoom(input);
      const room = new Room();
      room.roomName = input.roomName.trim();
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

  async checkDuplicateRoom(input: RoomCreateRequestDto) {
    try {
      const room = await this.repository.findOne({
        where: {
          roomName: input.roomName.trim(),
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
            stdRoomStatus: StdRoomStatus.ACTIVE,
            user: {
              userId: user.userId
            }
          },
          roomStatus: RoomStatus.OPEN
        }
      }
    );
  }


  /*------------------- SUB FUNCTION -------------------*/

  private validateRoom(data: RoomCreateRequestDto) {
    const errors: string[] = [];
    if (!data.roomName || data.roomName.trim() == "") {
      errors.push("roomName");
    }
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