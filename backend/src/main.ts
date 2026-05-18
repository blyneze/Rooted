import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Enforce strict Helmet security headers
  app.use(helmet());

  // 2. Configure robust CORS policies
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : [
        'http://localhost:19006', // Expo Web
        'http://localhost:8081',  // Metro bundler default port
        'http://localhost:3000',  // Local test interfaces
      ];
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  // 3. Version control API routes with global prefixing
  app.setGlobalPrefix('api/v1');

  // 4. Register strict validation pipe for mass-assignment prevention
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // Strip out fields not defined in the DTO
      forbidNonWhitelisted: true, // Reject requests containing unrecognized parameters
      transform: true,          // Auto-convert plain payloads to class instances
      transformOptions: {
        enableImplicitConversion: true, // Automatically parse parameter types (e.g., string to number)
      },
    })
  );

  // 5. Register global exception filter to sanitize internal stack trace leakage
  app.useGlobalFilters(new HttpExceptionFilter());

  // 6. Enable Graceful Shutdown Hooks (crucial for Docker/Kubernetes/Render deployments)
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  logger.log(`====================================================`);
  logger.log(`🚀 Rooted API Backend is running in production mode!`);
  logger.log(`📍 Port: ${port}`);
  logger.log(`🌍 API Root: http://localhost:${port}/api/v1`);
  logger.log(`====================================================`);
}
bootstrap();
