import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { supabase } from '../supabase.client';


const TOKEN_TIEMPO = '5m'; // 15m para 15 minutos
const JWT_SECRET = process.env.JWT_SECRET ?? 'secreto-dev'; 


@Injectable()
export class AuthService {
  private bucket = process.env.SUPABASE_BUCKET_AVATARS!; 

  constructor(private users: UsuariosService, private jwt: JwtService) {}

  private async subirFotoSupabase(params: { buffer: Buffer; contentType: string; objectPath: string;
  }): Promise<{ publicUrl: string; storagePath: string }> {
    const { data, error } = await supabase
      .storage.from(this.bucket)
      .upload(params.objectPath, params.buffer, {
        contentType: params.contentType,
        upsert: false,
      });

    if (error || !data) {
      throw new BadRequestException('No se pudo subir la imagen a Supabase');
    }

    const { data: pub } = supabase.storage.from(this.bucket).getPublicUrl(params.objectPath);
    return { publicUrl: pub.publicUrl, storagePath: data.path };
  }

  private async borrarFotoSupabase(path: string) {
    await supabase.storage.from(this.bucket).remove([path]);
  }

  async registro(
    dto: any,
    fileInfo?: { file?: Express.Multer.File; objectPath?: string }
  ) {
    let storagePath: string | null = null;
    let fotoUrl: string | null = null;

    if (fileInfo?.file && fileInfo.objectPath) {
      const up = await this.subirFotoSupabase({
        buffer: fileInfo.file.buffer,
        contentType: fileInfo.file.mimetype,
        objectPath: fileInfo.objectPath,
      });
      fotoUrl = up.publicUrl;
      storagePath = up.storagePath;
    }

    try {
      return await this.users.create({
        ...dto,
        fotoUrl: fotoUrl ?? null,
        storagePath: storagePath ?? null,
        habilitado: true,
      });
    } catch (e) {
      if (storagePath) await this.borrarFotoSupabase(storagePath).catch(() => {});
      throw e;
    }
  }

  async login(login: string, password: string) {
    const user = await this.users.findOneByLogin(login);
    if (!user || !user.habilitado) throw new UnauthorizedException('Usuario o Correo No Valido');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Contraseña Incorrecta');

    const payload = { sub: String(user._id), username: user.username, rol: user.rol };

    const token = await this.jwt.signAsync(payload, { expiresIn: TOKEN_TIEMPO, secret: JWT_SECRET });

    return { user: { ...user.toObject(), password: undefined }, token, payload };
  }

  async autorizar(token: string) {
    try {
      return await this.jwt.verifyAsync(token, { secret: JWT_SECRET }); 
    } catch {
      throw new UnauthorizedException();
    }
  }

  async refrescar(token: string) {
    const payload = await this.autorizar(token);
    const nuevo = await this.jwt.signAsync(
      { sub: payload.sub, username: payload.username, rol: payload.rol },
      { expiresIn: TOKEN_TIEMPO, secret: JWT_SECRET }
    );
    return { token: nuevo };
  }

  async userFromToken(token: string) {
    const payload = await this.jwt.verifyAsync(token, { secret: JWT_SECRET }); 
    const user = await this.users.findById(payload.sub);
    const plain = (user as any)?.toObject?.() ?? user;
    const { password, ...safeUser } = plain ?? {};
    return safeUser;
  }
}
