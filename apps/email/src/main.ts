import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { EmailModule } from './email.module';

async function bootstrap() {
  const kafkaBroker = process.env.KAFKA_BROKER || 'localhost:9092';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    EmailModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [kafkaBroker],
        },
        consumer: {
          groupId: 'email-group',
          brokers: [kafkaBroker],
        },
      },
    },
  );

  await app.listen();
  console.log('📧 Email microservice started');
}

bootstrap();