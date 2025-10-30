import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards, Put } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { JwtAuthGuard } from '../auth/guards/guards.guard';

@Controller('publicaciones')
@UseGuards(JwtAuthGuard)
export class PublicacionesController {
  constructor(private readonly service: PublicacionesService) {}

  @Post()
  crear(@Body() dto: any, @Req() req: any) {
    return this.service.crearPublicacion(dto, req.user.sub);
  }

  @Get()
  listar(@Query() q: any) {
    return this.service.listar(q); 
  }

  @Delete(':id')
  baja(@Param('id') id: string, @Req() req: any) {
    return this.service.bajaLogica(id, req.user);
  }

  @Post(':id/like')
  like(@Param('id') id: string, @Req() req: any) { return this.service.like(id, req.user.sub); }

  @Delete(':id/like')
  unlike(@Param('id') id: string, @Req() req: any) { return this.service.unlike(id, req.user.sub); }

  @Get(':id/comentarios')
  comentarios(@Param('id') id: string, @Query() q: any) { return this.service.comentarios(id, q); }

  @Post(':id/comentarios')
  comentar(@Param('id') id: string, @Body() body: { mensaje: string }, @Req() req: any) {
    return this.service.comentar(id, req.user.sub, body.mensaje);
  }

  @Put('comentarios/:cid')
  editarComentario(@Param('cid') cid: string, @Body() body: { mensaje: string }, @Req() req: any) {
    return this.service.editarComentario(cid, req.user.sub, body.mensaje);
  }
}
