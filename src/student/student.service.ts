import { BadRequestException, Injectable } from "@nestjs/common";
import { Student } from "./entities/student.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../user/entities/user.entity";
import { Repository } from "typeorm";
import { RoomService } from "../room/room.service";
import { UserService } from "../user/user.service";
import { Room } from "../room/entities/room.entity";
import { UserAndCsv } from "../user/dto/user-and-csv";
import { Exercise } from "../exercise/entities/exercise.entity";
import { StudentExercise } from "../student-exercise/entities/student-exercise.entity";
import { StudentStatus } from "./dto/student.enum";

@Injectable()
export class StudentService {

  constructor(
    @InjectRepository(Student)
    private readonly repository: Repository<Student>,
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
    @InjectRepository(StudentExercise)
    private readonly studentExerciseRepository: Repository<StudentExercise>,
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

          const exercises = await this.exerciseRepository.find({ where: { room: room } });

          const studentExercises: StudentExercise[] = [];
          for (const exec of exercises) {
            for (const stud of students) {
              const exist = await this.studentExerciseRepository.exist(
                {
                  where: {
                    exercise: exec,
                    student: stud
                  }
                }
              );
              if (!exist) {
                const studentExercise = new StudentExercise();
                studentExercise.exercise = exec;
                studentExercise.student = stud;
                studentExercises.push(studentExercise);
              }
            }
          }
          await this.studentExerciseRepository.save(studentExercises);
        } catch (e) {
          console.error(e.message);
        }
      }
      return res.userToCsv;
    } catch (e) {
      throw e;
    }
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