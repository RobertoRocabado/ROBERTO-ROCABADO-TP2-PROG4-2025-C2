import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsuariosService } from 'src/usuarios/usuarios.service';

const cookieExtractor = (req: Request) =>
  req?.cookies?.token ?? null;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usuariosService: UsuariosService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }

  // payload típico tuyo: { sub, username, rol, iat, exp }
  async validate(req: Request, payload: any) {
    if (!payload?.sub && !payload?.username) {
      throw new UnauthorizedException('Token inválido');
    }

    // buscá por id (sub) o por username
    const user =
      (payload.sub && (await this.usuariosService.findById(payload.sub))) ||
      (payload.username && (await this.usuariosService.findByUsername(payload.username)));

    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    // Devolvé lo que publicaciones necesita:
    return {
      nombre:   user.nombre,
      apellido: user.apellido,
      correo:   user.correo,   
      rol:      user.rol ?? payload.rol ?? 'user',
      id:       user._id?.toString?.(), 
      username: user.username,
      fotoUrl: user.fotoUrl ?? null
    };
  }
}
