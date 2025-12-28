import { IsNumber, IsUrl } from "class-validator";

export class CreateOrderDto {
  @IsUrl()
  url: string;

  @IsNumber()
  targetPrice: number;
}