import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario, UsuarioDocument } from './entities/usuario.entity';
import { Model } from 'mongoose';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';
import { MongoServerError } from 'mongodb';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private userModel: Model<UsuarioDocument>,
  ) {}

  private rethrowOrMap(e: any) {
    if (e instanceof HttpException) {
      throw e;
    }

    if (e instanceof MongoServerError && e.code === 11000) {
      const field = Object.keys(e.keyPattern ?? {})[0] || 'campo';
      throw new ConflictException({
        code: `DUPLICATE_${field}`,
        field,
        message: `${field} ya está en uso`,
      });
    }

    throw new InternalServerErrorException({
      code: 'UNEXPECTED_ERROR',
      message: 'Ocurrió un error inesperado',
    });
  }

  async create(dto: CreateUsuarioDto) {
    try {
      const dup = await this.userModel.exists({
        $or: [
          { correo: dto.correo.toLowerCase().trim() },
          { username: dto.username.toLowerCase().trim() },
        ],
      });
      if (dup) {
        const u = await this.userModel
          .findOne({
            $or: [
              { correo: dto.correo.toLowerCase().trim() },
              { username: dto.username.toLowerCase().trim() },
            ],
          })
          .lean();
        const field =
          u?.correo === dto.correo.toLowerCase().trim() ? 'correo' : 'username';
        throw new ConflictException({
          code: `DUPLICATE_${field}`,
          field,
          message: `${field} ya está en uso`,
        });
      }

      const hash = await bcrypt.hash(dto.password, 10);
      const created = await this.userModel.create({
        ...dto,
        correo: dto.correo.toLowerCase().trim(),
        username: dto.username.toLowerCase().trim(),
        password: hash,
      });
      return created.toObject();
    } catch (e) {
      this.rethrowOrMap(e);
    }
  }

  async findAll() {
    return this.userModel.find().lean();
  }

  async findOneByLogin(login: string) {
    return this.userModel
      .findOne({
        $or: [
          { correo: login.toLowerCase().trim() },
          { username: login.toLowerCase().trim() },
        ],
      })
      .exec();
  }

  async findById(id: string) {
    const u = await this.userModel.findById(id).lean();
    if (!u)
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado',
      });
    return u;
  }

  async findByUsername(username: string) {
    const u = await this.userModel
      .findOne({ username: (username ?? '').toLowerCase().trim() })
      .select('-password -__v')
      .lean();

    if (!u) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado',
      });
    }
    return u;
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    try {
      const patch: any = { ...dto };
      if (dto.password) patch.password = await bcrypt.hash(dto.password, 10);
      if (dto.correo) patch.correo = dto.correo.toLowerCase().trim();
      if (dto.username) patch.username = dto.username.toLowerCase().trim();

      const updated = await this.userModel.findByIdAndUpdate(id, patch, {
        new: true,
        runValidators: true,
      });
      if (!updated)
        throw new NotFoundException({
          code: 'USER_NOT_FOUND',
          message: 'Usuario no encontrado',
        });
      return updated.toObject();
    } catch (e) {
      this.rethrowOrMap(e);
    }
  }

  async deshabilitar(id: string) {
    const u = await this.userModel
      .findByIdAndUpdate(id, { habilitado: false }, { new: true })
      .lean();
    if (!u)
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado',
      });
    return u;
  }

  async habilitar(id: string) {
    const u = await this.userModel
      .findByIdAndUpdate(id, { habilitado: true }, { new: true })
      .lean();
    if (!u)
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado',
      });
    return u;
  }
}
