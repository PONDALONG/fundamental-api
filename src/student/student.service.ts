import { BadRequestException, Injectable } from "@nestjs/common";
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

@Injectable()
export class StudentService {

  constructor(
    @InjectRepository(Student)
    private readonly repository: Repository<Student>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(StudentAssignment)
    private readonly studentAssignmentRepository: Repository<StudentAssignment>,
    private readonly roomService: RoomService,
    private readonly userService: UserService
  ) {
  }

  /*------------------- MAIN FUNCTION -------------------*/

  async import(file: Express.Multer.File, roomId: number) {

    try {
      const students: Student[] = [];
      let room: Room = null;
      if (!!roomId) {
        room = await this.roomService.findByRoomId(roomId);
        if (!room) throw new BadRequestException(`ไม่พบ roomId : ${roomId}`);
      }

      const res: UserAndCsv = await this.userService.imports(file);

      if (!!roomId) {
        for (const i in res.user) {
          try {
            const haveStd: Student = await this.findByUser(res.user[i]);
            if (!!haveStd) {
              haveStd.studentStatus = StudentStatus.ACTIVE;
              haveStd.room = room;
              await this.repository.save(haveStd);
              res.userToCsv[i].result = "สำเร็จ";
              res.userToCsv[i].status = true;
              continue; // skip to next loop
            }

            const studentRoom = new Student();
            studentRoom.user = res.user[i];
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
        .select(["student", "user"])
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
}