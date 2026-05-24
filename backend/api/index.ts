import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import helmet from 'helmet';

let app: any;

async function bootstrap() {
  const nestApp = await NestFactory.create(AppModule);

  // 1. Enforce Helmet security headers (but turn off CSP as it's not needed for JSON APIs)
  nestApp.use(helmet({
    contentSecurityPolicy: false,
  }));

  // 2. Configure robust CORS policies
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : '*';

  nestApp.enableCors({
    origin: allowedOrigins === '*' ? true : allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  // 3. Version control API routes with global prefixing
  nestApp.setGlobalPrefix('api/v1');

  // 4. Register strict validation pipe for mass-assignment prevention
  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // 5. Register global exception filter
  nestApp.useGlobalFilters(new HttpExceptionFilter());

  await nestApp.init();

  return nestApp.getHttpAdapter().getInstance();
}

export default async function handler(req: any, res: any) {
  app = app ?? (await bootstrap());
  return app(req, res);
}
