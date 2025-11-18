import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { RangoFechasDto } from './dto/rango-fechas.dto';
import { JwtAuthGuard, RolAdminGuard } from '../auth/guards/guards.guard';

@UseGuards(JwtAuthGuard, RolAdminGuard)
@Controller('publicaciones/estadisticas')
export class EstadisticasController {
  constructor(private readonly service: EstadisticasService) {}

  // 1) Publicaciones por usuario
  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(@Query() dto: RangoFechasDto) {
    return this.service.publicacionesPorUsuario(dto);
  }

  // 2) Comentarios agrupados por fecha
  @Get('comentarios-por-fecha')
  comentariosPorFecha(@Query() dto: RangoFechasDto) {
    return this.service.comentariosPorFecha(dto);
  }

  // 3) Comentarios agrupados por publicación
  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(@Query() dto: RangoFechasDto) {
    return this.service.comentariosPorPublicacion(dto);
  }
}

