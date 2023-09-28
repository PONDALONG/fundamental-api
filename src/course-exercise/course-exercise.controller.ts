import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CourseExerciseService } from './course-exercise.service';
import { CreateCourseExerciseDto } from './dto/create-course-exercise.dto';
import { UpdateCourseExerciseDto } from './dto/update-course-exercise.dto';

@Controller('course-exercise')
export class CourseExerciseController {
  constructor(private readonly courseExerciseService: CourseExerciseService) {}

  @Post()
  create(@Body() createCourseExerciseDto: CreateCourseExerciseDto) {
    return this.courseExerciseService.create(createCourseExerciseDto);
  }

  @Get()
  findAll() {
    return this.courseExerciseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseExerciseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseExerciseDto: UpdateCourseExerciseDto) {
    return this.courseExerciseService.update(+id, updateCourseExerciseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseExerciseService.remove(+id);
  }
}
