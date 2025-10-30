import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.setGlobalPrefix('api'); 

  app.enableCors({
    origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/,
      'https://TU_FRONT.onrender.com',
    ],
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type','Authorization'],
  });

  await app.listen(3000);
}
bootstrap();