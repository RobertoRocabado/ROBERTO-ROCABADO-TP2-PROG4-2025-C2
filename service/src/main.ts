// import { BadRequestException, ValidationPipe } from '@nestjs/common';
// import cookieParser from 'cookie-parser';
// import { AppModule } from './app.module';
// import { NestFactory } from '@nestjs/core';
// import { FiltroExcepciones } from './auth/http-exception-filtro';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   app.use(cookieParser());
//   const isProd = process.env.NODE_ENV === 'production';

//   app.useGlobalPipes(new ValidationPipe({
//     whitelist: true,
//     forbidNonWhitelisted: true,
//     transform: true,
//     exceptionFactory: (errors) => {
//       const details = errors.map(e => ({
//         field: e.property,
//         constraints: e.constraints,
//       }));
//       return new BadRequestException({
//         code: 'VALIDATION_ERROR',
//         message: 'Datos inválidos',
//         details,
//       });
//     },
//   }));

//   app.useGlobalFilters(new FiltroExcepciones());

//   app.enableCors({
//     origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/,
//       // 'https://roberto-rocabado-tp-2-prog-4-2025-c.vercel.app/',
//     ],
//     methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
//     credentials: true,
//     allowedHeaders: ['Content-Type','Authorization'],
//   });

//   await app.listen(process.env.PORT || 3000, '0.0.0.0');
// }
// bootstrap();
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { FiltroExcepciones } from './auth/http-exception-filtro';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const isProd = process.env.NODE_ENV === 'production';

  // Permite que NestJS reconozca encabezados X-Forwarded-* en Vercel/Render
  // app.set('trust proxy', 1);
  const httpAdapter = app.getHttpAdapter();

// Si es Express, se puede acceder al objeto interno:
const instance = httpAdapter.getInstance();

// Solo si la plataforma es Express se puede usar set()
if (instance?.set) {
  instance.set('trust proxy', 1);
}

  // Lista de orígenes permitidos (whitelist)
  const ALLOWED_ORIGINS = [
    /^http:\/\/localhost:\d+$/,          // localhost:4200 o cualquier puerto
    /^http:\/\/127\.0\.0\.1:\d+$/,       // 127.0.0.1
    /^https:\/\/roberto-rocabado-tp-2-prog-4-2025-c\.vercel\.app$/, // producción Vercel
  ];

  // Opcional: permitir cualquier preview de Vercel (*.vercel.app)
  const allowVercelPreview = (origin?: string) =>
    !!origin && /\.vercel\.app$/.test(new URL(origin).hostname);

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin Origin (Postman / health checks)
      if (!origin) return callback(null, true);

      if (
        ALLOWED_ORIGINS.some((regex) => regex.test(origin)) ||
        allowVercelPreview(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error(`❌ CORS bloqueado para: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const details = errors.map((e) => ({
          field: e.property,
          constraints: e.constraints,
        }));
        return new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Datos inválidos',
          details,
        });
      },
    })
  );

  app.useGlobalFilters(new FiltroExcepciones());

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}

bootstrap();
