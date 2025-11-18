import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { memoryStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtAuthGuard, RolAdminGuard } from '../auth/guards/guards.guard';
import { AuthService } from '../auth/auth.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly service: UsuariosService,
    private readonly authService: AuthService, 
  ) {}

  // ===== LISTADO SOLO PARA ADMIN =====
  @UseGuards(JwtAuthGuard, RolAdminGuard)
  @Get()
  findAll() {
    return this.service.findAllParaAdmin();
  }

  // ===== CREAR USUARIO POR ADMIN (form-data + foto) =====
  @UseGuards(JwtAuthGuard, RolAdminGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          // si no es imagen rechazamos
          return cb(new Error('El archivo debe ser una imagen'), false);
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @Body() dto: CreateUsuarioDto,
    @UploadedFile() foto?: Express.Multer.File,
  ) {
    const ext = extname(foto?.originalname ?? '') || '.jpg';

    const objectPath = foto
      ? `usuarios/${dto.username}/${dto.username}-${Date.now()}${ext}`
      : undefined;

    // reutilizamos toda la logica de AuthService.registro:
    // subir a supabase, setear fotoUrl/storagePath y crear usuario
    return this.authService.registro(dto, { file: foto, objectPath });
  }

  // ===== UPDATE =====
  @UseGuards(JwtAuthGuard, RolAdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
    return this.service.update(id, dto);
  }

  // ===== DESHABILITAR / HABILITAR =====
  @UseGuards(JwtAuthGuard, RolAdminGuard)
  @Delete(':id')
  deshabilitar(@Param('id') id: string) {
    return this.service.deshabilitar(id);
  }

  @UseGuards(JwtAuthGuard, RolAdminGuard)
  @Post(':id/habilitar')
  habilitar(@Param('id') id: string) {
    return this.service.habilitar(id);
  }

  // ===== PUBLICO: buscar usuario por username =====
  @Get(':username')
  getByUsername(@Param('username') username: string) {
    return this.service.findByUsername(username);
  }
}
