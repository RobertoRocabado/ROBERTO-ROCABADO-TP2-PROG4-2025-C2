import {
  BadRequestException, Body, Controller, Post, Res, Req,
  UseInterceptors, UploadedFile,
  Get,
} from '@nestjs/common';
import express from 'express';
import { AuthService } from './auth.service';
import { CreateUsuarioDto } from 'src/usuarios/dto/create-usuario.dto';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express'; // <-- agregado AnyFilesInterceptor
import { memoryStorage } from 'multer';
import { extname } from 'path';
import type { Request } from 'express';
import { CookieOptions } from 'express';


@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  isProd = process.env.NODE_ENV === 'production';

  private cookieBase: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // sameSite: 'lax' as const,
    sameSite: this.isProd ? 'none' : 'lax',
    // sameSite: 'none',
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
  @UseInterceptors(AnyFilesInterceptor()) // <-- clave para form-data
  async login(
    @Body() body: any,
    @Res({ passthrough: true }) res: express.Response
  ) {
    const login = body?.login;
    const password = body?.password;
    if (!login || !password) {
      throw new BadRequestException('login y password son requeridos');
    }

    const { token, user } = await this.service.login(login, password);

    res.cookie('token', token, {
      ...this.cookieBase,
      maxAge: 8 * 60 * 60 * 1000, //8 horas debo cambiarlo tambien en el auth.service para que este sincronizados
      //maxAge: 15 * 60 * 1000, // 15 minutos 
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
    const token = (req as any).cookies?.token || bearer || '';

    if (!token) return { ok: false };

    try {
      const payload = await this.service.autorizar(token);
      return { ok: true, ...payload };
    } catch {
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

  // ========================= ME =========================
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
