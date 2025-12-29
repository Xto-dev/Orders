import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsUrl } from "class-validator";

export class CreateOrderDto {
  @ApiProperty()
  @IsUrl()
  url: string;

  @ApiProperty()
  @IsNumber()
  targetPrice: number;
}