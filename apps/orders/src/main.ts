import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const config = new DocumentBuilder()
      .setTitle('Order Service API')
      .setDescription('API documentation for the Order Service')
      .setVersion('1.0')
      .addTag('orders')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: ['kafka:29092'],
        },
        consumer: {
          groupId: 'scrape-group'
        }
      },
    });
  
  await app.startAllMicroservices()
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
