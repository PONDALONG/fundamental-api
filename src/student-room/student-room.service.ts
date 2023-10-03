import { BadRequestException, Injectable } from "@nestjs/common";
import { StudentRoom } from "./entities/student-room.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../user/entities/user.entity";
import { Repository } from "typeorm";
import { RoomService } from "../room/room.service";
import { UserService } from "../user/user.service";
import { Room } from "../room/entities/room.entity";
import { UserAndCsv } from "../user/dto/user-and-csv";
import { StdRoomStatus } from "./entities/std-room-status.enum";

@Injectable()
export class StudentRoomService {

  constructor(
    @InjectRepository(StudentRoom)
    private readonly repository: Repository<StudentRoom>,
    private readonly roomService: RoomService,
    private readonly userService: UserService
  ) {
  }

  async importStudent(file: Express.Multer.File, roomId: number) {

    try {

      let room: Room = null;
      if (!!roomId) {
        room = await this.roomService.findByRoomId(roomId);
        if (!room) throw new BadRequestException("room not found");
      }

      const res: UserAndCsv = await this.userService.imports(file);

      if (!!roomId) {
        for (const i in res.user) {
          try {
            const haveStd: StudentRoom = await this.findByUserAndRoom(res.user[i], room);
            if (!!haveStd) {
              if (haveStd.stdCourseStatus ===StdRoomStatus.ACTIVE) {
                res.userToCsv[i].resultCreateStudentRoom = "duplicate";
                throw new Error("duplicate");
              }else {
                haveStd.stdCourseStatus = StdRoomStatus.ACTIVE;
                await this.repository.save(haveStd);
                res.userToCsv[i].resultCreateStudentRoom = "success";
                continue; // skip to next loop
              }
            }

            const stdCourse = new StudentRoom();
            stdCourse.user = res.user[i];
            stdCourse.room = room;
            await this.repository.save(stdCourse);
            res.userToCsv[i].resultCreateStudentRoom = "success";
          } catch (e) {
            res.userToCsv[i].resultCreateStudentRoom = "save error : " + e.message;
          }
        }
      }
      return res.userToCsv;
    } catch (e) {
      throw e;
    }
  }

  async findAllByUser(user: User) {
    return await this.repository.find(
      {
        where: {
          user: user
        }
      }
    );
  }

  async findAll() {
    return await this.repository.find(
      {
        relations: ["user", "course"]
      }
    );
  }

  async findByUserAndRoom(user: User, room: Room) {
    return await this.repository.findOne(
      {
        where: {
          user: user,
          room: room
        }
      });
  }
}