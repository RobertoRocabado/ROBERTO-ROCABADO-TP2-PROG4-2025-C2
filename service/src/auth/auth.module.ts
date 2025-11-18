import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { JwtStrategy } from './jwt.strategy/jwt.strategy.service';

@Module({
  imports: [
    // UsuariosModule,
    JwtModule.register({ secret: process.env.JWT_SECRET ?? 'secreto-dev' }),
    forwardRef(() => UsuariosModule),    
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
