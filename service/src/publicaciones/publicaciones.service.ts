import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { Publicacion, PublicacionDocument } from './entities/publicaciones.entity';
import { CreatePublicacionDto } from './dto/create-publicaciones.dto';
import { ListPublicacionesDto } from './dto/list-publicaciones.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { supabase } from '../supabase.client';
import { Types } from 'mongoose';

type UsuarioJwtSnap = {
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  fotoUrl: string;
};

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly pubModel: Model<PublicacionDocument>,
  ) {}

  private async subirImagenASupabase(
    archivo: Express.Multer.File,
    correoUsuario: string,
  ): Promise<string> {
    const extension =
      archivo.originalname.split('.').pop()?.toLowerCase() || 'bin';
    const ruta = `u_${correoUsuario}/${randomUUID()}.${extension}`;
    const bucket = process.env.SUPABASE_BUCKET_PUBLICACIONES!;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(ruta, archivo.buffer, {
        contentType: archivo.mimetype,
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(ruta);
    return data.publicUrl;
  }

  async create(
    usuario: UsuarioJwtSnap,
    dto: CreatePublicacionDto,
    archivo?: Express.Multer.File,
  ) {
    let imagenUrl: string | undefined;

    if (archivo?.buffer?.length) {
      imagenUrl = await this.subirImagenASupabase(archivo, usuario.correo);
    }

    const doc = await this.pubModel.create({
      usuario: {
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        rol: usuario.rol,
        fotoUrl: usuario.fotoUrl,
      },
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      imagenUrl,
      habilitado: true,
      likesCount: 0,
      likedBy: [],
      comentarios: [],
    });

    return this.sanitizar(doc);
  }

  async list(q: ListPublicacionesDto & { userCorreo?: string }) {
    const filtro: any = { habilitado: true };

    const offset = Math.max(0, Number(q.offset ?? 0));
    const limit = Math.max(1, Number(q.limit ?? 10));

    const orden =
      q.sortBy === 'likes'
        ? ({ likesCount: -1, createdAt: -1 } as Record<string, 1 | -1>)
        : ({ createdAt: -1 } as Record<string, 1 | -1>);

    const [items, total] = await Promise.all([
      this.pubModel
        .find(filtro)
        .sort(orden as any)
        .skip(offset)
        .limit(limit)
        .lean(),
      this.pubModel.countDocuments(filtro),
    ]);

    return {
      items: items.map(this.sanitizar),
      total,
      offset,
      limit,
    };
  }

  async softDelete(
    publicacionId: string,
    solicitante: { correo: string; rol?: string },
    esAdmin: boolean,
  ) {
    const pub = await this.pubModel.findById(publicacionId);
    if (!pub || !pub.habilitado) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const esDueno = pub.usuario?.correo === solicitante.correo;
    if (!esDueno && !esAdmin) {
      throw new ForbiddenException(
        'No autorizado para eliminar esta publicación.',
      );
    }

    await this.pubModel.updateOne(
      { _id: publicacionId },
      { $set: { habilitado: false, updatedAt: new Date() } },
    );

    return { ok: true };
  }

  async like(publicacionId: string, usuario: { correo: string }) {
    const actualizado = await this.pubModel.findOneAndUpdate(
      {
        _id: publicacionId,
        habilitado: true,
        likedBy: { $ne: usuario.correo },
      },
      { $addToSet: { likedBy: usuario.correo }, $inc: { likesCount: 1 } },
      { new: true },
    );

    return actualizado ? this.sanitizar(actualizado) : { alreadyLiked: true };
  }

  async unlike(publicacionId: string, usuario: { correo: string }) {
    const actualizado = await this.pubModel.findOneAndUpdate(
      { _id: publicacionId, habilitado: true, likedBy: usuario.correo },
      { $pull: { likedBy: usuario.correo }, $inc: { likesCount: -1 } },
      { new: true },
    );

    return actualizado ? this.sanitizar(actualizado) : { notLiked: true };
  }

  async addComment(
    publicacionId: string,
    autor: UsuarioJwtSnap,
    dto: CreateComentarioDto,
  ) {
    const actualizado = await this.pubModel.findOneAndUpdate(
      { _id: publicacionId, habilitado: true },
      {
        $push: {
          comentarios: {
            autor: {
              nombre: autor.nombre,
              apellido: autor.apellido,
              correo: autor.correo,
              rol: autor.rol,
              fotoUrl: autor.fotoUrl,
            },
            texto: dto.texto,
            createdAt: new Date(),
            //para el sprint 3
            modificado: false,
            updatedAt: null,
            // ====
          },
        },
      },
      { new: true },
    );

    if (!actualizado) throw new NotFoundException('Publicación no encontrada');
    return this.sanitizar(actualizado);
  }


  async listComentarios(
    publicacionId: string,
    q: { offset?: number; limit?: number },
  ) {
    const _id = new Types.ObjectId(publicacionId);
    const offset = Math.max(0, Number(q.offset ?? 0));
    const limit = Math.max(1, Number(q.limit ?? 10));

    const res = await this.pubModel.aggregate([
      { $match: { _id, habilitado: true } },
      {
        $project: {
          total: { $size: '$comentarios' },
          comentarios: {
            $slice: [{ $reverseArray: '$comentarios' }, offset, limit],
          },
        },
      },
    ]);

    if (!res.length) {
      return { items: [], total: 0, offset, limit };
    }

    const { comentarios, total } = res[0];
    const items = (comentarios || []).map((c: any) => ({
      ...c,
      _id: String(c._id),
    }));

    return { items, total, offset, limit };
  }

  // Editar un comentario

  async editarComentario(
    publicacionId: string,
    comentarioId: string,
    solicitante: { correo: string; rol?: string; roles?: string[] },
    texto: string,
  ) {
    const _pubId = new Types.ObjectId(publicacionId);
    const _comId = new Types.ObjectId(comentarioId);

    const pub = await this.pubModel
      .findOne(
        { _id: _pubId, habilitado: true, 'comentarios._id': _comId },
        { 'comentarios.$': 1 },
      )
      .lean();

    if (!pub || !pub.comentarios?.length) {
      throw new NotFoundException('Comentario no encontrado');
    }

    const comentario = pub.comentarios[0];

    const rolStr = (solicitante?.rol ?? '').toString().toLowerCase();
    const rolesArr: string[] = Array.isArray(solicitante?.roles)
      ? solicitante.roles.map((r: any) => String(r).toLowerCase())
      : [];
    const isAdmin =
      rolStr === 'administrador' || rolesArr.includes('administrador');

    const esAutor = comentario?.autor?.correo === solicitante?.correo;

    if (!esAutor && !isAdmin) {
      throw new ForbiddenException(
        'No estás autorizado para editar este comentario',
      );
    }

    await this.pubModel.updateOne(
      { _id: _pubId, 'comentarios._id': _comId },
      {
        $set: {
          'comentarios.$.texto': texto,
          'comentarios.$.modificado': true,
          'comentarios.$.updatedAt': new Date(),
        },
      },
    );

    const actualizado = await this.pubModel.aggregate([
      { $match: { _id: _pubId } },
      { $unwind: '$comentarios' },
      { $match: { 'comentarios._id': _comId } },
      {
        $replaceRoot: { newRoot: '$comentarios' },
      },
      { $limit: 1 },
    ]);

    if (!actualizado.length) {
      throw new NotFoundException('Comentario no encontrado tras la edición');
    }

    const c = actualizado[0];
    return { ...c, _id: String(c._id) };
  }

  // Para obtener la publicacion y mostrar en pantalla
  async getById(id: string) {
    const doc = await this.pubModel
      .findOne({ _id: id, habilitado: true })
      .lean();

    if (!doc) throw new NotFoundException('Publicación no encontrada');

    const sane = this.sanitizar(doc);
    return { ...sane, _id: sane._id ? String(sane._id) : String(doc._id) };
  }

  //=======================
  // sanitizar
  private sanitizar = (doc: any) => {
    if (!doc) return doc;
    const plain = doc.toObject?.() ?? doc;
    const { __v, ...resto } = plain;
    return { ...resto, _id: String(resto._id) };
  };
}
