import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { OrderStatus} from ".prisma/client";
import { ClientKafka } from "@nestjs/microservices";
import { CreateOrderDto } from "./dto/CreateOrderDto";


@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,
  ) {}

  async create(userId: string, email: string, dto: CreateOrderDto) {
    const order = await this.prisma.order.create({
        data: {
          userId: userId,
          url: dto.url,
          targetPrice: dto.targetPrice,
          status: OrderStatus.PENDING,
        }
      });

    this.kafkaClient.emit('scrape-requests', {
      orderId: order.id,
      email: email,
      url: order.url,
      requestId: `scrape_${order.id}`,
    });

    return order;
  }

  async handleScrapeResult(result: any) {
    const { orderId, email, price } = result;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    console.log('Order found for scrape result:', order);
    if (!order) return;

    await this.prisma.order.update({
      data: {
        currentPrice: price,
        status: price <= order.targetPrice ? OrderStatus.COMPLETED : OrderStatus.PENDING,
      },
      where: { id: orderId },
    });

    if (price <= order.targetPrice) {
      this.kafkaClient.emit('user-events', {
        event: 'price.dropped',
        userId: order.userId,
        email: email,
        url: order.url,
        price,
      });
    }
  }
}