import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { memoryStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service';
import { CreatePublicacionDto } from './dto/create-publicaciones.dto';
// import { ListPublicacionesDto } from './dto/list-publicaciones.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { JwtAuthGuard } from '../auth/guards/guards.guard';

@Controller('publicaciones')
@UseGuards(JwtAuthGuard)
export class PublicacionesController {
  constructor(private readonly service: PublicacionesService) {}

  // Crear publicación (imagen opcional en campo 'imagen')
  // Pasamos el usuario completo al service y también el archivo (el service sube la imagen).
  @Post()
  @UseInterceptors(FileInterceptor('imagen', { storage: memoryStorage() }))
  async create(
    @Req() req: any,
    @Body() dto: CreatePublicacionDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // req.user debe contener: { nombre, apellido, correo, rol }
    return this.service.create(req.user, dto, file);
  }

  @Get()
  async list(@Query() q: any) {
    // 1) Normalizar sortBy con alias sort
    const sortBy: 'fecha' | 'likes' = q.sortBy ?? q.sort ?? 'fecha';

    // 2) Normalizar limit
    const limit = Math.max(1, parseInt(q.limit ?? '10', 10) || 10);

    // 3) Calcular offset: si viene offset úsalo; si viene page, lo derivamos
    let offset = 0;
    if (q.offset !== undefined) {
      offset = Math.max(0, parseInt(q.offset, 10) || 0);
    } else if (q.page !== undefined) {
      const page = Math.max(1, parseInt(q.page, 10) || 1);
      offset = (page - 1) * limit;
    }

    // 4) Filtrado opcional por usuario
    const userCorreo = q.userCorreo ?? undefined;

    return this.service.list({ sortBy, offset, limit, userCorreo } as any);
  }

  // Baja lógica (solo autor o admin)
  @Delete(':id')
  async softDelete(@Req() req: any, @Param('id') id: string) {
    const esAdmin =
      req.user?.rol === 'admin' || req.user?.roles?.includes?.('admin');
    return this.service.softDelete(id, req.user, esAdmin);
  }

  // Like / Unlike usando el correo del usuario para unicidad
  @Post(':id/likes')
  async like(@Req() req: any, @Param('id') id: string) {
    return this.service.like(id, req.user);
  }

  @Delete(':id/likes')
  async unlike(@Req() req: any, @Param('id') id: string) {
    return this.service.unlike(id, req.user);
  }

  @Post(':id/comentarios')
  async addComment(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CreateComentarioDto,
  ) {
    return this.service.addComment(id, req.user, dto);
  }
}
