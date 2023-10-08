import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { StudentAssignment } from "./entities/student-assignment.entity";
import { DataSource, In, Repository } from "typeorm";
import { Assignment } from "../assignment/entities/assignment.entity";
import { Student } from "../student/entities/student.entity";
import { AssignmentType } from "../assignment/dto/assignment.enum";
import { CheckStdAsm, FormIntoGroups } from "./dto/student-assignment.model";

@Injectable()
export class StudentAssignmentService {
  constructor(
    @InjectRepository(StudentAssignment)
    private readonly repository: Repository<StudentAssignment>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    private dataSource: DataSource
  ) {
  }

  /*------------------- MAIN FUNCTION -------------------*/

  autoGenerate(assignment: Assignment, students: Student[]): StudentAssignment[] {
    const studentAssignments: StudentAssignment[] = Array<StudentAssignment>();

    for (const student of students) {
      const save = new StudentAssignment();
      save.assignment = assignment;
      save.student = student;
      studentAssignments.push(save);
    }

    return studentAssignments;
  }

  async findAll(assignmentId: number): Promise<StudentAssignment[]> {
    return await this.repository.createQueryBuilder("stdAsm")
      .innerJoin("stdAsm.assignment", "assignment")
      .innerJoin("stdAsm.student", "student")
      .innerJoin("student.user", "user")
      .select(["stdAsm", "student", "user"])
      .where("assignment.assignmentId = :assignmentId", { assignmentId: assignmentId })
      .getMany();
  }

  async formIntoGroups(input: FormIntoGroups) {
    const existAsm = await this.assignmentRepository.exist({
      where: {
        assignmentId: input.assignmentId
      }
    });
    if (!existAsm) {
      throw new BadRequestException("ไม่พบข้อมูล แบบฝึกหัด");
    }

    const stdAsms = await this.repository.find({
      where: {
        stdAsmId: In(input.stdAsmIds)
      }
    });

    for (const stdAsm of stdAsms) {
      stdAsm.stdAsmGroup = input.stdAsmGroup;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(stdAsms);
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(e);
    } finally {
      await queryRunner.release();
    }

  }


  async checkAssignment(input: CheckStdAsm) {
    const stdAsm = await this.repository.createQueryBuilder("stdAsm")
      .innerJoin("stdAsm.assignment", "assignment")
      .select(["stdAsm", "assignment"])
      .where("stdAsm.stdAsmId = :stdAsmId", { stdAsmId: input.stdAsmId })
      .andWhere("assignment.assignmentId = :assignmentId", { assignmentId: input.assignmentId })
      .getOne();

    if (!stdAsm) {
      throw new BadRequestException("ไม่พบข้อมูล แบบฝึกหัด");
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    if (stdAsm.assignment.assignmentType === AssignmentType.INDIVIDUAL) {

      stdAsm.stdAsmScore = input.stdAsmScore;
      await queryRunner.manager.save(stdAsm);
    } else {
      // give score to group
      const stdAsms = await this.repository.find({
        where: {
          stdAsmGroup: stdAsm.stdAsmGroup,
          assignment: stdAsm.assignment
        }
      });

      const query = "UPDATE student_assignment SET std_asm_score = ? WHERE std_asm_group = ? and assignment_id = ?";

      try {
        await this.repository.query(query, [input.stdAsmScore, stdAsm.stdAsmGroup, stdAsm.assignment.assignmentId]);
      } catch (error) {
        throw new Error(`Error updating rows: ${error.message}`);
      }
    }


  }


  /*------------------- SUB FUNCTION -------------------*/

}
