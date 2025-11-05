import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtAuthGuard, RolAdminGuard } from '../auth/guards/guards.guard';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly service: UsuariosService) {}

  @UseGuards(JwtAuthGuard, RolAdminGuard)
  @Get() findAll() { return this.service.findAll(); }

  // @UseGuards(JwtAuthGuard, RolAdminGuard)
  // @Post() create(@Body() dto: CreateUsuarioDto) { return this.service.create(dto); }
  @Post()
create(@Body() dto: CreateUsuarioDto) {
  return this.service.create(dto);
}


  @UseGuards(JwtAuthGuard, RolAdminGuard)
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) { return this.service.update(id, dto); }

  @UseGuards(JwtAuthGuard, RolAdminGuard)
  @Delete(':id') deshabilitar(@Param('id') id: string) { return this.service.deshabilitar(id); }

  @UseGuards(JwtAuthGuard, RolAdminGuard)
  @Post(':id/habilitar') habilitar(@Param('id') id: string) { return this.service.habilitar(id); }

  @Get(':username')
  getByUsername(@Param('username') username: string) {
    return this.service.findByUsername(username);
  }
}
