import { IsNumberString } from "class-validator";
import { IsBlankNull } from "../../utils/custom-validator";

export class RoomCreateRequestDto {

  @IsNumberString()
  roomId: number;

  @IsBlankNull()
  roomDescription: string;

  @IsNumberString()
  roomYear: number;

  @IsBlankNull()
  roomGroup: string;

  @IsNumberString()
  roomTerm: number;

}