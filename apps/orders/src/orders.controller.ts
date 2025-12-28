import { Request, Controller, Get, Post, UseGuards, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateOrderDto } from './dto/CreateOrderDto';

@Controller()
export class OrdersController {
  constructor(private readonly appService: OrdersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    const userId = req.user.sub;
    const email = req.user.email;

    return this.appService.create(userId, email, createOrderDto);
  }
}
