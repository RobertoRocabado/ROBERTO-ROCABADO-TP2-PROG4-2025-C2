// import { AuthGuard } from '@nestjs/passport';
// import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

// export class JwtAuthGuard extends AuthGuard('jwt') {}

// @Injectable()
// export class RolAdminGuard implements CanActivate {
//   canActivate(ctx: ExecutionContext): boolean {
//     const req = ctx.switchToHttp().getRequest();
//     const user = req.user;
//     if (user?.rol !== 'administrador') throw new ForbiddenException('Solo administradores');
//     return true;
//   }
// }

import { AuthGuard } from '@nestjs/passport';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

// Guard JWT: verifica que el token sea valido y pone el payload en req.user
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// Guard de rol administrador: solo permite acceso a usuarios con rol "administrador"
@Injectable()
export class RolAdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    // Si por algun motivo no hay usuario en la request,
    // es porque el JwtAuthGuard fallo o no se ejecuto
    if (!user) {
      throw new UnauthorizedException('Token no valido o no enviado');
    }

    // Control estricto de rol
    if (user.rol !== 'administrador') {
      throw new ForbiddenException('Solo administradores');
    }

    return true;
  }
}
