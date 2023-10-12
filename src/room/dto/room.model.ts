import { IsBlankNull, IsNumberStr } from "../../utils/custom-validator";
import { RoomStatus } from "./room.enum";
import { IsEnum } from "class-validator";
import { Room } from "../entities/room.entity";
import { Assignment } from "../../assignment/entities/assignment.entity";

export class RoomCreate {

  @IsNumberStr()
  roomYear: number;

  @IsBlankNull()
  roomGroup: string;

  @IsNumberStr()
  roomTerm: number;

  @IsEnum(RoomStatus)
  roomStatus: RoomStatus;

}

export class RoomUpdate extends RoomCreate {

  @IsNumberStr()
  roomId: number;

}

export class Dropdown {

  years: number[] = [];

  terms: number[] = [];
}