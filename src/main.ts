import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  const config = new DocumentBuilder()
  .setTitle('KaspiBot API')
  .setDescription('API for KaspiBot management')
  .setVersion('1.0')
  .addBearerAuth( // This is what makes the "Authorize" button appear
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
    },
    'access-token', // <- this name MUST match @ApiBearerAuth('access-token')
  )
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);

  // Global Validation Pipe to handle DTO validation
  // app.useGlobalPipes(new ValidationPipe({
  //   whitelist: true,  // Automatically strip properties that do not have decorators in the DTO
  //   forbidNonWhitelisted: true,  // Throw an error if non-whitelisted properties are present
  //   transform: true,  // Automatically transform payloads to be objects typed according to their DTO classes
  // }));

  await app.listen(3000);
}
bootstrap();
