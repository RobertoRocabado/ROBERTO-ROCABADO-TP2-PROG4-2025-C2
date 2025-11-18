import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicacionesController } from './publicaciones.controller';
import { PublicacionesService } from './publicaciones.service';
import { Publicacion, PublicacionSchema } from './entities/publicaciones.entity';

import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from './estadisticas.service';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Publicacion.name, schema: PublicacionSchema }]),
  ],
  controllers: [PublicacionesController, EstadisticasController],
  providers: [PublicacionesService, EstadisticasService],
})
export class PublicacionesModule {}