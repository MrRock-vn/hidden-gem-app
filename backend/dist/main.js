"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const env_validation_service_1 = require("./config/env-validation.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const envValidation = app.get(env_validation_service_1.EnvValidationService);
    envValidation.validateEnvironment();
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: false,
        allowedHeaders: 'Content-Type,Authorization',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Hidden Gem API')
        .setDescription('REST API for Hidden Gem - A location-based social discovery platform for finding hidden gem places')
        .setVersion('1.0.0')
        .addServer('http://localhost:3000', 'Development')
        .addServer('https://api.hiddengem.app', 'Production')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token',
    }, 'access_token')
        .addTag('Auth', 'Authentication endpoints')
        .addTag('Users', 'User management endpoints')
        .addTag('Places', 'Place management endpoints')
        .addTag('Social', 'Comments, likes, follows')
        .addTag('Search', 'Place search and filtering')
        .addTag('Notifications', 'Push notifications management')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document, {
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
//# sourceMappingURL=main.js.map