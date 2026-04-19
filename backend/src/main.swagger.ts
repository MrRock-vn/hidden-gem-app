import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
    customCss: `
      .topbar { display: none; }
      .swagger-ui .topbar { display: block; }
    `,
  });

  // Start application
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 API docs available at http://localhost:${port}/api-docs`);
}

bootstrap();
