import { Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from "@nestjs/common";

@Controller("exercise")
export class ExerciseController {

  @Post("create")
  @HttpCode(HttpStatus.OK)
  async create() {
    //todo create
  }

  @Get("find-by-room")
  @HttpCode(HttpStatus.OK)
  async findByRoom(@Query('roomId') roomId : number){
    return roomId;
    //todo find by room
  }

  @Post("update")
  @HttpCode(HttpStatus.OK)
  async update() {
    //todo update
  }

}