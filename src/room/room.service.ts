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
      await this.checkDuplicateRoom(input);
      const room = new Room();
      room.roomName = input.roomName.trim();
      room.roomDescription = input.roomDescription.trim();
      room.roomYear = input.roomYear;
      room.roomGroup = input.roomGroup.trim();
      room.roomTerm = input.roomTerm;

      const save = await this.repository.save(room);
      if (!save) throw new BadRequestException("save error");
    } catch (e) {
      throw e;
    }
  }

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
      if (room) throw new BadRequestException("course duplicate");
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
            stdCourseStatus: StdRoomStatus.ACTIVE,
            user: {
              userId: user.userId
            }
          },
          roomStatus: RoomStatus.OPEN
        }
      }
    );
  }
}