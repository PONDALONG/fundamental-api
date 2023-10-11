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

export class Dropdown {

  years: number[] = [];

  terms: number[] = [];
}


export class FindFilter {

  @IsNumberStr()
  year: number;

  @IsNumberStr()
  term: number;
}