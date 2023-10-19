import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Student } from "./entities/student.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../user/entities/user.entity";
import { Repository } from "typeorm";
import { RoomService } from "../room/room.service";
import { UserService } from "../user/user.service";
import { Room } from "../room/entities/room.entity";
import { Assignment } from "../assignment/entities/assignment.entity";
import { StudentAssignment } from "../student-assignment/entities/student-assignment.entity";
import { StudentStatus } from "./dto/student.enum";
import { UserAndCsv } from "../user/dto/user.model";
import { Dropdown } from "../room/dto/room.model";

@Injectable()
export class StudentService {

  constructor(
    @InjectRepository(Student)
    private readonly repository: Repository<Student>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(StudentAssignment)
    private readonly studentAssignmentRepository: Repository<StudentAssignment>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly roomService: RoomService,
    private readonly userService: UserService
  ) {
  }

  /*------------------- MAIN FUNCTION -------------------*/

  async import(file: Express.Multer.File, roomId: number) {

    try {
      const students: Student[] = [];
      if (!roomId) throw new BadRequestException("กรุณาระบุห้องเรียน");

      let room = await this.roomService.findByRoomId(roomId);

      if (!room) throw new BadRequestException(`ไม่พบ roomId : ${roomId}`);

      const res: UserAndCsv = await this.userService.imports(file);

      if (!!roomId) {
        for (const i in res.users) {
          try {
            if (!res.userToCsv[i].status)
              continue; // skip to next loop

            const haveStd: Student = await this.findByUser(res.users[i]);
            if (!!haveStd) {
              haveStd.studentStatus = StudentStatus.ACTIVE;
              haveStd.room = room;
              await this.repository.save(haveStd);
              res.userToCsv[i].result = "สำเร็จ";
              res.userToCsv[i].status = true;
              students.push(haveStd);
              continue; // skip to next loop
            }

            const studentRoom = new Student();
            studentRoom.user = res.users[i];
            studentRoom.room = room;
            const save = await this.repository.save(studentRoom);

            students.push(save);
            res.userToCsv[i].result = "สำเร็จ";
            res.userToCsv[i].status = true;
          } catch (e) {
            res.userToCsv[i].result = "บันทึกข้อมูลผิดพลาด : " + e.message;
            res.userToCsv[i].status = false;
          }
        }
        try {

          const assignments = await this.assignmentRepository.find({ where: { room: room } });

          const studentAssignments: StudentAssignment[] = [];
          for (const asm of assignments) {
            for (const stud of students) {
              const exist = await this.studentAssignmentRepository.exist(
                {
                  where: {
                    assignment: asm,
                    student: stud
                  }
                }
              );
              if (!exist) {
                const studentAssignment = new StudentAssignment();
                studentAssignment.assignment = asm;
                studentAssignment.student = stud;
                studentAssignments.push(studentAssignment);
              }
            }
          }
          await this.studentAssignmentRepository.save(studentAssignments);
        } catch (e) {
          console.error(e.message);
        }
      }
      return res.userToCsv;
    } catch (e) {
      throw e;
    }
  }

  async findAll(roomYear: number, roomGroup: string, roomTerm: number) {

    let result: Student[] = [];

    try {
      roomYear = roomYear || 0;
      roomTerm = roomTerm || 0;
      roomGroup = roomGroup || "";

      result = await this.repository.createQueryBuilder("student")
        .innerJoin("student.user", "user")
        .innerJoin("student.room", "rm")
        .where("rm.roomYear = :roomYear AND rm.roomGroup = :roomGroup AND rm.roomTerm = :roomTerm",
          { roomYear, roomGroup, roomTerm }
        )
        .select(["student.studentId", "user.userId", "user.nameTH", "user.nameEN", "user.studentNo"])
        .orderBy("user.studentNo", "ASC")
        .getMany();
    } catch (e) {
      throw new BadRequestException(e.message);
    }

    return result;
  }

  async update(input: any) {

  }


  /*------------------- SUB FUNCTION -------------------*/

  async findByUser(user: User) {
    return await this.repository.findOne(
      {
        where: {
          user: user
        }
      });
  }

  async findAllByRom(room: Room) {
    {
      try {
        return await this.repository.find({
          where: {
            room: room
          }
        });
      } catch (e) {
        throw e;
      }
    }
  }

  async dropdownFilter() {

    try {

      const roomsYears = await this.roomRepository.createQueryBuilder("room").select(["room.roomYear"]).groupBy("room.roomYear").getMany();
      const roomGroup = await this.roomRepository.createQueryBuilder("room").select(["room.roomGroup"]).groupBy("room.roomGroup").getMany();

      const dropdown = new Dropdown();

      for (const i of roomsYears) dropdown.years.push(i.roomYear);
      for (const i of roomGroup) dropdown.groups.push(i.roomGroup);

      return dropdown;
    } catch (e) {
      throw new BadRequestException("ไม่สามารถดึงข้อมูลได้ : " + e.message);
    }
  }

  async findByUserId(userId: number) {
    try {
      const student = await this.repository.findOne({
        relations: ["user", "room"],
        where: {
          user: {
            userId: userId
          }
        },
        select: ["user", "room"]
      });

      if (!student) throw new NotFoundException("ไม่พบข้อมูลนักศึกษา");
      return student;
    } catch (e) {
      throw e;
    }
  }
}