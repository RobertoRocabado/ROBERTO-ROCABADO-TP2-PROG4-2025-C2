// import {
//   Body,
//   Controller,
//   Delete,
//   Get,
//   Param,
//   Post,
//   Query,
//   Req,
//   UploadedFile,
//   UseGuards,
//   UseInterceptors,
// } from '@nestjs/common';
// import { memoryStorage } from 'multer';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { PublicacionesService } from './publicaciones.service';
// import { CreatePublicacionDto } from './dto/create-publicaciones.dto';
// import { CreateComentarioDto } from './dto/create-comentario.dto';
// import { JwtAuthGuard } from '../auth/guards/guards.guard';

// @Controller('publicaciones')
// @UseGuards(JwtAuthGuard)
// export class PublicacionesController {
//   constructor(private readonly service: PublicacionesService) {}

//   @Post()
//   @UseInterceptors(FileInterceptor('imagen', { storage: memoryStorage() }))
//   async create(
//     @Req() req: any,
//     @Body() dto: CreatePublicacionDto,
//     @UploadedFile() file?: Express.Multer.File,
//   ) {
//     return this.service.create(req.user, dto, file);
//   }

//   @Get()
//   async list(@Query() q: any) {
//     const sortBy: 'fecha' | 'likes' = q.sortBy ?? q.sort ?? 'fecha';

//     const limit = Math.max(1, parseInt(q.limit ?? '10', 10) || 10);

//     let offset = 0;
//     if (q.offset !== undefined) {
//       offset = Math.max(0, parseInt(q.offset, 10) || 0);
//     } else if (q.page !== undefined) {
//       const page = Math.max(1, parseInt(q.page, 10) || 1);
//       offset = (page - 1) * limit;
//     }

//     const userCorreo = q.userCorreo ?? undefined;

//     return this.service.list({ sortBy, offset, limit, userCorreo } as any);
//   }

//   @Delete(':id')
//   async softDelete(@Req() req: any, @Param('id') id: string) {
//     const esAdmin =
//       req.user?.rol === 'admin' || req.user?.roles?.includes?.('admin');
//     return this.service.softDelete(id, req.user, esAdmin);
//   }

//   @Post(':id/likes')
//   async like(@Req() req: any, @Param('id') id: string) {
//     return this.service.like(id, req.user);
//   }

//   @Delete(':id/likes')
//   async unlike(@Req() req: any, @Param('id') id: string) {
//     return this.service.unlike(id, req.user);
//   }

//   @Post(':id/comentarios')
//   async addComment(
//     @Req() req: any,
//     @Param('id') id: string,
//     @Body() dto: CreateComentarioDto,
//   ) {
//     return this.service.addComment(id, req.user, dto);
//   }
// }

// =====================================================

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
  import { CreateComentarioDto } from './dto/create-comentario.dto';
import { JwtAuthGuard } from '../auth/guards/guards.guard';

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

  @Delete(':id')
  async softDelete(@Req() req: any, @Param('id') id: string) {
    const esAdmin =
      req.user?.rol === 'administrador' || req.user?.roles?.includes?.('administrador');
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
}
