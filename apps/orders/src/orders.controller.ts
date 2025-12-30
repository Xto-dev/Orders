import { Request, Controller, Get, Post, UseGuards, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateOrderDto } from './dto/CreateOrderDto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';

@ApiBearerAuth('JWT')
@Controller('orders')
export class OrdersController {
  constructor(private readonly appService: OrdersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    const userId = req.user.userId;
    const email = req.user.email;

    return this.appService.create(userId, email, createOrderDto);
  }

  @MessagePattern('scrape-results')
  async handleScrapeResult(@Payload() result: any) {
    console.log('Received scrape result:', result);
    if (result.status === 'completed') {
      await this.appService.handleScrapeResult(result);
    }
  }
}