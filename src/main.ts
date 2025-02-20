import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global Validation Pipe to handle DTO validation
  // app.useGlobalPipes(new ValidationPipe({
  //   whitelist: true,  // Automatically strip properties that do not have decorators in the DTO
  //   forbidNonWhitelisted: true,  // Throw an error if non-whitelisted properties are present
  //   transform: true,  // Automatically transform payloads to be objects typed according to their DTO classes
  // }));

  await app.listen(3001);
}
bootstrap();
