import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  const config = new DocumentBuilder()
    .setTitle('AlmanakKlub API')
    .setDescription(
      'RESTful API dataset klub sepak bola — MongoDB, MinIO, AI (Ollama)',
    )
    .setVersion('1.0')
    .addTag('clubs', 'CRUD data klub')
    .addTag('images', 'Upload/ambil gambar klub (MinIO)')
    .addTag('ai', 'Komentator AI (proxy Ollama)')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`API   : http://localhost:${port}/api`);
  console.log(`Swagger: http://localhost:${port}/docs`);
}
bootstrap();
