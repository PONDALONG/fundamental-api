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

  async import(file: Express.Multer.File, roomId: number) {

    try {

      let room: Room = null;
      if (!!roomId) {
        room = await this.roomService.findByRoomId(roomId);
        if (!room) throw new BadRequestException(`ไม่พบ roomId : ${roomId}`);
      }

      const res: UserAndCsv = await this.userService.imports(file);

      if (!!roomId) {
        for (const i in res.user) {
          try {
            const haveStd: StudentRoom = await this.findByUser(res.user[i]);
            if (!!haveStd) {
              haveStd.stdRoomStatus = StdRoomStatus.ACTIVE;
              haveStd.room = room;
              await this.repository.save(haveStd);
              res.userToCsv[i].result = "สำเร็จ";
              res.userToCsv[i].status = true;
              continue; // skip to next loop
            }

            const studentRoom = new StudentRoom();
            studentRoom.user = res.user[i];
            studentRoom.room = room;
            await this.repository.save(studentRoom);
            res.userToCsv[i].result = "สำเร็จ";
            res.userToCsv[i].status = true;
          } catch (e) {
            res.userToCsv[i].result = "บันทึกข้อมูลผิดพลาด : " + e.message;
            res.userToCsv[i].status = false;
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

  async findByUser(user: User) {
    return await this.repository.findOne(
      {
        where: {
          user: user
        }
      });
  }

  async update(input: any) {

  }

  async findById(id: number) {
    return await this.repository.findOne({
      where: {
        stdRoomId: id
      }
    });
  }
}