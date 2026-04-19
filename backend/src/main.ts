import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { EnvValidationService } from './config/env-validation.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validate environment variables
  const envValidation = app.get(EnvValidationService);
  envValidation.validateEnvironment();

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: false,
    allowedHeaders: 'Content-Type,Authorization',
  });

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Hidden Gem API')
    .setDescription(
      'REST API for Hidden Gem - A location-based social discovery platform for finding hidden gem places',
    )
    .setVersion('1.0.0')
    .addServer('http://localhost:3000', 'Development')
    .addServer('https://api.hiddengem.app', 'Production')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token',
      },
      'access_token',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Places', 'Place management endpoints')
    .addTag('Social', 'Comments, likes, follows')
    .addTag('Search', 'Place search and filtering')
    .addTag('Notifications', 'Push notifications management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 1,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Hidden Gem API running on http://localhost:${port}`);
  console.log(`📝 API prefix: /api`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api-docs`);
}

bootstrap();
