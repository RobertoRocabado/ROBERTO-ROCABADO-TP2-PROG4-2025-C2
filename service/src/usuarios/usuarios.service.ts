import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario, UsuarioDocument } from './entities/usuario.entity';
import { Model } from 'mongoose';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(@InjectModel(Usuario.name) private userModel: Model<UsuarioDocument>) {}

  async create(dto: CreateUsuarioDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    const created = await this.userModel.create({ ...dto, password: hash });
    return created.toObject();
  }

  async findAll() {
    return this.userModel.find().lean();
  }

  async findOneByLogin(login: string) {
    return this.userModel.findOne({ $or: [{ correo: login }, { username: login }] }).exec();
  }

  async findById(id: string) {
    const u = await this.userModel.findById(id).lean();
    if (!u) throw new NotFoundException('Usuario no encontrado');
    return u;
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    if (dto.password) dto.password = await bcrypt.hash(dto.password, 10);
    return this.userModel.findByIdAndUpdate(id, dto, { new: true }).lean();
  }

  async deshabilitar(id: string) {
    return this.userModel.findByIdAndUpdate(id, { habilitado: false }, { new: true }).lean();
  }

  async habilitar(id: string) {
    return this.userModel.findByIdAndUpdate(id, { habilitado: true }, { new: true }).lean();
  }
}
