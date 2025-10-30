import { AuthGuard } from '@nestjs/passport';
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class RolAdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (user?.rol !== 'administrador') throw new ForbiddenException('Solo administradores');
    return true;
  }
}
