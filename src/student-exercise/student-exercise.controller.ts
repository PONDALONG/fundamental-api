import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StudentExerciseService } from './student-exercise.service';
import { CreateStudentExerciseDto } from './dto/create-student-exercise.dto';
import { UpdateStudentExerciseDto } from './dto/update-student-exercise.dto';

@Controller('student-exercise')
export class StudentExerciseController {
  constructor(private readonly studentExerciseService: StudentExerciseService) {}

  @Post()
  create(@Body() createStudentExerciseDto: CreateStudentExerciseDto) {
    return this.studentExerciseService.create(createStudentExerciseDto);
  }

  @Get()
  findAll() {
    return this.studentExerciseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentExerciseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentExerciseDto: UpdateStudentExerciseDto) {
    return this.studentExerciseService.update(+id, updateStudentExerciseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentExerciseService.remove(+id);
  }
}
