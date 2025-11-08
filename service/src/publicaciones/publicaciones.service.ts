// import {
//   ForbiddenException,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { randomUUID } from 'crypto';
// import {
//   Publicacion,
//   PublicacionDocument,
// } from './entities/publicaciones.entity';
// import { CreatePublicacionDto } from './dto/create-publicaciones.dto';
// import { ListPublicacionesDto } from './dto/list-publicaciones.dto';
// import { CreateComentarioDto } from './dto/create-comentario.dto';
// import { supabase } from '../supabase.client';

// type UsuarioJwtSnap = {
//   nombre: string;
//   apellido: string;
//   correo: string;
//   rol: string;
//   fotoUrl: string;
// };

// @Injectable()
// export class PublicacionesService {
//   constructor(
//     @InjectModel(Publicacion.name)
//     private readonly pubModel: Model<PublicacionDocument>,
//   ) {}

//   private async subirImagenASupabase(
//     archivo: Express.Multer.File,
//     correoUsuario: string,
//   ): Promise<string> {
//     const extension = (
//       archivo.originalname.split('.').pop() || 'bin'
//     ).toLowerCase();
//     const ruta = `u_${correoUsuario}/${randomUUID()}.${extension}`;
//     const bucket = process.env.SUPABASE_BUCKET_PUBLICACIONES!;

//     const { error } = await supabase.storage
//       .from(bucket)
//       .upload(ruta, archivo.buffer, {
//         contentType: archivo.mimetype,
//         upsert: false,
//       });

//     if (error) throw error;

//     const { data } = supabase.storage.from(bucket).getPublicUrl(ruta);
//     return data.publicUrl;
//   }

//   async create(
//     usuario: UsuarioJwtSnap,
//     dto: CreatePublicacionDto,
//     archivo?: Express.Multer.File,
//   ) {
//     let imagenUrl: string | undefined;

//     if (archivo?.buffer?.length) {
//       imagenUrl = await this.subirImagenASupabase(archivo, usuario.correo);
//     }

//     const doc = await this.pubModel.create({
//       usuario: {
//         nombre: usuario.nombre,
//         apellido: usuario.apellido,
//         correo: usuario.correo,
//         rol: usuario.rol,
//         fotoUrl: usuario.fotoUrl,
//       },
//       titulo: dto.titulo,
//       descripcion: dto.descripcion,
//       imagenUrl,
//       habilitado: true,
//       likesCount: 0,
//       likedBy: [],
//       comentarios: [],
//     });
//     const plain = this.sanitizar(doc); // nuevo
//     return { ...plain, _id: String(plain._id) }; //nuevo
//     // return this.sanitizar(doc);
//   }

//   async list(q: ListPublicacionesDto & { userCorreo?: string }) {
//     const filtro: any = { habilitado: true };

//     const toInt = (v: any, def: number) => {
//       const n = parseInt(String(v ?? ''), 10);
//       return Number.isFinite(n) ? n : def;
//     };

//     const offset = Math.max(0, toInt(q.offset, 0));
//     const limit = Math.max(1, toInt(q.limit, 10));

//     const orden: Record<string, 1 | -1> =
//       q.sortBy === 'likes'
//         ? { likesCount: -1, createdAt: -1 }
//         : { createdAt: -1 };

//     const [items, total] = await Promise.all([
//       this.pubModel.find(filtro).sort(orden).skip(offset).limit(limit).lean(),
//       this.pubModel.countDocuments(filtro),
//     ]);

//     return {
//       // items: items.map((it: any) => ({
//       //   ...this.sanitizar(it),
//       //   comentarios: Array.isArray(it?.comentarios) ? it.comentarios : [],
//       //   likedBy: Array.isArray(it?.likedBy) ? it.likedBy : [],
//       //   likesCount: Number.isFinite(it?.likesCount) ? it.likesCount : 0,
//       // })),
//       items: items.map((it: any) => {
//         const sane = this.sanitizar(it);
//         return { ...sane, _id: sane._id ? String(sane._id) : String(it._id) };
//       }),
//       total,
//       offset,
//       limit,
//     };
//   }

//   async softDelete(
//     publicacionId: string,
//     solicitante: { correo: string; rol?: string },
//     esAdmin: boolean,
//   ) {
//     const pub = await this.pubModel.findById(publicacionId);
//     if (!pub || !pub.habilitado) {
//       throw new NotFoundException('Publicación no encontrada');
//     }

//     const esDueno = pub.usuario?.correo === solicitante.correo;
//     if (!esDueno && !esAdmin) {
//       throw new ForbiddenException(
//         'No autorizado para eliminar esta publicación.',
//       );
//     }

//     pub.habilitado = false;
//     await pub.save();
//     return { ok: true };
//   }

//   async like(publicacionId: string, usuario: { correo: string }) {
//     const actualizado = await this.pubModel.findOneAndUpdate(
//       {
//         _id: publicacionId,
//         habilitado: true,
//         likedBy: { $ne: usuario.correo },
//       },
//       { $addToSet: { likedBy: usuario.correo }, $inc: { likesCount: 1 } },
//       { new: true },
//     );
//     if (!actualizado) return { alreadyLiked: true };
//     return this.sanitizar(actualizado);
//   }

//   async unlike(publicacionId: string, usuario: { correo: string }) {
//     const actualizado = await this.pubModel.findOneAndUpdate(
//       { _id: publicacionId, habilitado: true, likedBy: usuario.correo },
//       { $pull: { likedBy: usuario.correo }, $inc: { likesCount: -1 } },
//       { new: true },
//     );
//     if (!actualizado) return { notLiked: true };
//     return this.sanitizar(actualizado);
//   }

//   async addComment(
//     publicacionId: string,
//     autor: UsuarioJwtSnap,
//     dto: CreateComentarioDto,
//   ) {
//     const actualizado = await this.pubModel.findOneAndUpdate(
//       { _id: publicacionId, habilitado: true },
//       {
//         $push: {
//           comentarios: {
//             autor: {
//               nombre: autor.nombre,
//               apellido: autor.apellido,
//               correo: autor.correo,
//               rol: autor.rol,
//               fotoUrl: autor.fotoUrl,
//             },
//             texto: dto.texto,
//             createdAt: new Date(),
//           },
//         },
//       },
//       { new: true },
//     );

//     if (!actualizado) throw new NotFoundException('Publicación no encontrada');
//     return this.sanitizar(actualizado);
//   }

//   private sanitizar = (doc: any) => {
//     if (!doc) return doc;
//     const plain = doc.toObject ? doc.toObject() : doc;
//     const { __v, ...resto } = plain;
//     return { ...resto, _id: resto?._id ? String(resto._id) : undefined };
//   };
// }


// ===========================================================

// src/publicaciones/publicaciones.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import {
  Publicacion,
  PublicacionDocument,
} from './entities/publicaciones.entity';
import { CreatePublicacionDto } from './dto/create-publicaciones.dto';
import { ListPublicacionesDto } from './dto/list-publicaciones.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { supabase } from '../supabase.client';

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
    const extension = archivo.originalname.split('.').pop()?.toLowerCase() || 'bin';
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

    // ✅ Number() en vez de parseInt sobre string
    const offset = Math.max(0, Number(q.offset ?? 0));
    const limit = Math.max(1, Number(q.limit ?? 10));

    // ✅ objeto simple de sort; casteo para satisfacer tipos de Mongoose
    const orden =
      q.sortBy === 'likes'
        ? ({ likesCount: -1, createdAt: -1 } as Record<string, 1 | -1>)
        : ({ createdAt: -1 } as Record<string, 1 | -1>);

    const [items, total] = await Promise.all([
      this.pubModel.find(filtro).sort(orden as any).skip(offset).limit(limit).lean(),
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

    // ✅ Evita error de tipo con updatedAt asignando via $set
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
          },
        },
      },
      { new: true },
    );

    if (!actualizado) throw new NotFoundException('Publicación no encontrada');
    return this.sanitizar(actualizado);
  }

  private sanitizar = (doc: any) => {
    if (!doc) return doc;
    const plain = doc.toObject?.() ?? doc;
    const { __v, ...resto } = plain;
    return { ...resto, _id: String(resto._id) };
  };
}
