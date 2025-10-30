import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';
import { AuthModule } from './auth/auth.module';
import { env } from 'process';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRoot(process.env.MONGO_URL ?? 'mongodb+srv://roberto-rocabado:utn1997@trabajo-practico.zfpmwhi.mongodb.net/'),
    UsuariosModule,
    PublicacionesModule,
    AuthModule,
  ],
})
export class AppModule {}
