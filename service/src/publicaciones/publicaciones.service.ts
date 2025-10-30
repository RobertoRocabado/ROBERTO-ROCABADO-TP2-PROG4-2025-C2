import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { Publicacion, PublicacionDocument, Comentario, ComentarioDocument } from './entities/publicacione.entity';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private pubModel: Model<PublicacionDocument>,
    @InjectModel(Comentario.name) private comModel: Model<ComentarioDocument>,
  ) {}

  async crearPublicacion(dto: any, userId: string) {
    return this.pubModel.create({ ...dto, usuarioId: new Types.ObjectId(userId) });
  }

  async listar({ orden = 'fecha', offset = 0, limit = 10, usuarioId }: any) {
  const match: any = { activa: true };
  if (usuarioId) match.usuarioId = new Types.ObjectId(usuarioId);

  const sortFecha: Record<string, 1 | -1> = { createdAt: -1 as -1 };
  const sortLikes: Record<string, 1 | -1> = { meGustaCount: -1 as -1, createdAt: -1 as -1 };
  const sort = orden === 'likes' ? sortLikes : sortFecha;

  const pipeline: PipelineStage[] = [
    { $match: match },
    { $addFields: { meGustaCount: { $size: { $ifNull: ['$meGustaDe', []] } } } },
    { $sort: sort },
    { $skip: Number(offset) },
    { $limit: Number(limit) },
  ];

  return this.pubModel.aggregate(pipeline);
}


  async bajaLogica(id: string, solicitante: { sub: string; rol: string }) {
    const pub = await this.pubModel.findById(id);
    if (!pub) throw new NotFoundException();
    if (String(pub.usuarioId) !== solicitante.sub && solicitante.rol !== 'administrador')
      throw new ForbiddenException();
    pub.activa = false;
    await pub.save();
    await this.comModel.updateMany({ publicacionId: pub._id }, { $set: { modificado: true } }).exec();
    return { ok: true };
  }

  async like(id: string, userId: string) {
    await this.pubModel.updateOne({ _id: id, meGustaDe: { $ne: userId } }, { $push: { meGustaDe: userId } });
    return { ok: true };
  }
  async unlike(id: string, userId: string) {
    await this.pubModel.updateOne({ _id: id }, { $pull: { meGustaDe: userId } });
    return { ok: true };
  }

  // Comentarios
  async comentar(publicacionId: string, userId: string, mensaje: string) {
    return this.comModel.create({ publicacionId, usuarioId: userId, mensaje });
  }

  async editarComentario(id: string, userId: string, mensaje: string) {
    const c = await this.comModel.findById(id);
    if (!c) throw new NotFoundException();
    if (String(c.usuarioId) !== userId) throw new ForbiddenException();
    c.mensaje = mensaje; c.modificado = true; return c.save();
  }

  async comentarios(publicacionId: string, { offset=0, limit=10 }: any) {
    return this.comModel
      .find({ publicacionId })
      .sort({ createdAt: -1 })
      .skip(+offset)
      .limit(+limit)
      .lean();
  }
}
