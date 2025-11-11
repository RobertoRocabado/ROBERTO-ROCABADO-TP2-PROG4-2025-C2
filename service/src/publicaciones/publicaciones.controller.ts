import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { memoryStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service';
import { CreatePublicacionDto } from './dto/create-publicaciones.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { JwtAuthGuard } from '../auth/guards/guards.guard';
import { UpdateComentarioDto } from './dto/update-publicaciones.dto';

@Controller('publicaciones')
@UseGuards(JwtAuthGuard)
export class PublicacionesController {
  constructor(private readonly service: PublicacionesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('imagen', { storage: memoryStorage() }))
  async create(
    @Req() req: any,
    @Body() dto: CreatePublicacionDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.create(req.user, dto, file);
  }

  @Get()
  async list(@Query() q: any) {
    const sortBy: 'fecha' | 'likes' = q.sortBy ?? q.sort ?? 'fecha';
    const limit = Math.max(1, parseInt(q.limit ?? '10', 10));

    let offset = 0;
    if (q.offset) {
      offset = Math.max(0, parseInt(q.offset, 10));
    } else if (q.page) {
      const page = Math.max(1, parseInt(q.page, 10));
      offset = (page - 1) * limit;
    }

    return this.service.list({ sortBy, offset, limit } as any);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Delete(':id')
  async softDelete(@Req() req: any, @Param('id') id: string) {
    const esAdmin =
      req.user?.rol === 'administrador' ||
      req.user?.roles?.includes?.('administrador');
    return this.service.softDelete(id, req.user, esAdmin);
  }

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

  // Para el sprint 3

  @Get(':id/comentarios')
  async listComentarios(
    @Param('id') id: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listComentarios(id, {
      offset: offset != null ? Number(offset) : undefined,
      limit: limit != null ? Number(limit) : undefined,
    });
  }

  @Put(':id/comentarios/:comentarioId')
  async editarComentario(
    @Req() req: any,
    @Param('id') id: string,
    @Param('comentarioId') comentarioId: string,
    @Body() dto: UpdateComentarioDto,
  ) {
    return this.service.editarComentario(id, comentarioId, req.user, dto.texto);
  }
}
