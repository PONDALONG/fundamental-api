import { IsBlankNull, IsNumberStr } from "../../utils/custom-validator";

export class RoomCreate {

  @IsBlankNull()
  roomDescription: string;

  @IsNumberStr()
  roomYear: number;

  @IsBlankNull()
  roomGroup: string;

  @IsNumberStr()
  roomTerm: number;

}