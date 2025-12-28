import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const config = new DocumentBuilder()
      .setTitle('Auth Service API')
      .setDescription('API documentation for the Auth Service')
      .setVersion('1.0')
      .addTag('auth')
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);
  
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
