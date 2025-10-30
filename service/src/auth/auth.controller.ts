import {
  BadRequestException, Body, Controller, Post, Res, Req,
  UseInterceptors, UploadedFile,
  Get
} from '@nestjs/common';
import express from 'express';
import { AuthService } from './auth.service';
import { CreateUsuarioDto } from 'src/usuarios/dto/create-usuario.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import type { Request } from 'express';
import {CookieOptions} from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  private cookieBase = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const, 
    path: '/', 
  };

  // ========================= REGISTRO =========================
  @Post('registro')
  @UseInterceptors(FileInterceptor('foto', {
    storage: memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new BadRequestException('El archivo debe ser una imagen'), false);
      }
      cb(null, true);
    }
  }))
  async registro(@Body() dto: CreateUsuarioDto, @UploadedFile() foto?: Express.Multer.File) {
    const ext = extname(foto?.originalname ?? '') || '.jpg';
    const objectPath = foto
      ? `usuarios/${dto.username}/${dto.username}-${Date.now()}${ext}`
      : undefined;

    return this.service.registro(dto, { file: foto, objectPath });
  }

  // ========================= LOGIN =========================
  @Post('login')
  async login(
    @Body() body: any,
    @Res({ passthrough: true }) res: express.Response
  ) {
    const { login, password } = body;
    const { token, user } = await this.service.login(login, password);

    res.cookie('token', token, {
      ...this.cookieBase,
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    return { user };
  }

  // ========================= LOGOUT =========================
  @Post('logout')
  logout(@Res({ passthrough: true }) res: express.Response) {
    res.clearCookie('token', this.cookieBase);
    res.cookie('token', '', { ...this.cookieBase, maxAge: 0 });
    return { ok: true };
  }

  // ========================= AUTORIZAR =========================

@Post('autorizar')
async autorizar(@Req() req: Request) {
  const bearer = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  const token =
    (req as any).cookies?.token || bearer || '';

  // Si no hay token, responde 200 con ok:false (no logueado)
  if (!token) return { ok: false };

  try {
    const payload = await this.service.autorizar(token);
    return { ok: true, ...payload };
  } catch {
    // Token inválido/expirado -> NO 401; devolvemos ok:false para no ensuciar consola
    return { ok: false };
  }
}

  // ========================= REFRESCAR =========================
  @Post('refrescar')
  async refrescar(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
    const token =
      (req as any).cookies?.token ||
      req.headers.authorization?.replace('Bearer ', '');
    const { token: nuevo } = await this.service.refrescar(token);

    res.cookie('token', nuevo, {
      ...this.cookieBase,
      maxAge: 15 * 60 * 1000,
    });

    return { ok: true };
  }

  // ========================= NUEVO =========================
  @Get('me')
  async me(@Req() req: Request) {
    const token = (req as any).cookies?.token;

    if (!token) return { ok: false };

    try {
      const user = await this.service.userFromToken(token); 
      return { ok: true, user };
    } catch {
      return { ok: false };
    }
  }
}



