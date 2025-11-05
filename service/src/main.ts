import { BadRequestException, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { FiltroExcepciones } from './auth/http-exception-filtro';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors:true});
  app.use(cookieParser());
  const isProd = process.env.NODE_ENV === 'production';

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) => {
      const details = errors.map(e => ({
        field: e.property,
        constraints: e.constraints,
      }));
      return new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Datos inválidos',
        details,
      });
    },
  }));

  app.useGlobalFilters(new FiltroExcepciones());

  app.enableCors({
    origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/,
      'https://vercel.com/roberto-rocabados-projects/roberto-rocabado-tp-2-prog-4-2025-c2-868b',
    ],
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type','Authorization'],
  });

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();