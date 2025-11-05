// import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { randomUUID } from 'crypto';
// import { Publicacion, PublicacionDocument } from './entities/publicaciones.entity';
// import { CreatePublicacionDto } from './dto/create-publicaciones.dto';
// import { ListPublicacionesDto } from './dto/list-publicaciones.dto';
// import { CreateComentarioDto } from './dto/create-comentario.dto';
// import { supabase } from '../supabase.client';

// @Injectable()
// export class PublicacionesService {
//   constructor(
//     @InjectModel(Publicacion.name)
//     private readonly pubModel: Model<PublicacionDocument>,
//   ) {}

//   // =========================================================
//   // Subir imagen a Supabase (interno a este service)
//   // =========================================================
//   private async subirImagenASupabase(
//     archivo: Express.Multer.File,
//     correoUsuario: string, // lo uso solo para organizar la carpeta
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

//   // =========================================================
//   // Crear publicación
//   // - usuario: viene del JWT -> { nombre, apellido, correo, rol, ... }
//   // - dto: { titulo, descripcion }
//   // - archivo: imagen opcional (campo 'imagen')
//   // =========================================================
//   async create(
//     usuario: { nombre: string; apellido: string; correo: string; rol: string },
//     dto: CreatePublicacionDto,
//     archivo?: Express.Multer.File,
//   ) {
//     let imagenUrl: string | undefined = undefined;

//     if (archivo?.buffer?.length) {
//       imagenUrl = await this.subirImagenASupabase(archivo, usuario.correo);
//     }

//     const doc = await this.pubModel.create({
//       usuario: {
//         nombre: usuario.nombre,
//         apellido: usuario.apellido,
//         correo: usuario.correo,
//         rol: usuario.rol,
//       },
//       titulo: dto.titulo,
//       descripcion: dto.descripcion,
//       imagenUrl,
//       habilitado: true,
//       likesCount: 0,
//       likedBy: [],
//       comentarios: [], // 👈 importante
//     });

//     return this.sanitizar(doc);
//   }

//   // =========================================================
//   // Listar publicaciones (orden/paginación/filtro por usuario)
//   // - sortBy: 'fecha' | 'likes' (default 'fecha')
//   // - offset / limit
//   // - userCorreo (opcional) para filtrar publicaciones de un usuario particular
//   // =========================================================
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

//     console.log(
//       '[list] dto:',
//       q,
//       '=> offset:',
//       offset,
//       'limit:',
//       limit,
//       'sortBy:',
//       q.sortBy,
//     );

//     const [items, total] = await Promise.all([
//       this.pubModel.find(filtro).sort(orden).skip(offset).limit(limit).lean(),
//       this.pubModel.countDocuments(filtro),
//     ]);

//     return {
//       items: items.map((it: any) => ({
//         ...this.sanitizar(it),
//         comentarios: Array.isArray(it?.comentarios) ? it.comentarios : [],
//         likedBy: Array.isArray(it?.likedBy) ? it.likedBy : [],
//         likesCount: Number.isFinite(it?.likesCount) ? it.likesCount : 0,
//       })),
//       total,
//       offset,
//       limit,
//     };
//   }

//   // =========================================================
//   // Baja lógica (solo autor o admin)
//   // - solicitante: { correo, rol, ... } desde JWT
//   // =========================================================
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

//   // =========================================================
//   // Like / Unlike (un solo like por usuario)
//   // - usamos el correo del usuario para controlar unicidad
//   // =========================================================
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

//   // =========================================================
//   // Comentarios
//   // - guarda autor dentro del comentario (nombre, apellido, correo, rol)
//   // =========================================================
//   async addComment(
//     publicacionId: string,
//     autor: { nombre: string; apellido: string; correo: string; rol: string , fotoPerfil: string},
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
//               // fotoUrl: autor.fotoUrl,
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

//   // =========================================================
//   // Utilidad: limpiar campos internos
//   // =========================================================
//   private sanitizar = (doc: any) => {
//     if (!doc) return doc;
//     const plain = doc.toObject ? doc.toObject() : doc;
//     const { __v, ...resto } = plain;
//     return resto;
//   };
// }


//==========================================

import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { Publicacion, PublicacionDocument } from './entities/publicaciones.entity';
import { CreatePublicacionDto } from './dto/create-publicaciones.dto';
import { ListPublicacionesDto } from './dto/list-publicaciones.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { supabase } from '../supabase.client';

type UsuarioJwtSnap = {
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  fotoUrl: string; // 👈 imprescindible para tu schema
};

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly pubModel: Model<PublicacionDocument>,
  ) {}

  // =========================================================
  // Subir imagen a Supabase (interno a este service)
  // =========================================================
  private async subirImagenASupabase(
    archivo: Express.Multer.File,
    correoUsuario: string,
  ): Promise<string> {
    const extension = (archivo.originalname.split('.').pop() || 'bin').toLowerCase();
    const ruta = `u_${correoUsuario}/${randomUUID()}.${extension}`;
    const bucket = process.env.SUPABASE_BUCKET_PUBLICACIONES!;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(ruta, archivo.buffer, { contentType: archivo.mimetype, upsert: false });

    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(ruta);
    return data.publicUrl;
  }

  // =========================================================
  // Crear publicación
  // =========================================================
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
        fotoUrl: usuario.fotoUrl, // 👈 ahora se persiste
      },
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      imagenUrl,
      habilitado: true,
      likesCount: 0,
      likedBy: [],
      comentarios: [],
    });
    const plain = this.sanitizar(doc); // nuevo
    return { ...plain, _id: String(plain._id) }; //nuevo
    // return this.sanitizar(doc);
  }

  // =========================================================
  // Listar publicaciones
  // =========================================================
  async list(q: ListPublicacionesDto & { userCorreo?: string }) {
    const filtro: any = { habilitado: true };

    const toInt = (v: any, def: number) => {
      const n = parseInt(String(v ?? ''), 10);
      return Number.isFinite(n) ? n : def;
    };

    const offset = Math.max(0, toInt(q.offset, 0));
    const limit = Math.max(1, toInt(q.limit, 10));

    const orden: Record<string, 1 | -1> =
      q.sortBy === 'likes'
        ? { likesCount: -1, createdAt: -1 }
        : { createdAt: -1 };

    const [items, total] = await Promise.all([
      this.pubModel.find(filtro).sort(orden).skip(offset).limit(limit).lean(),
      this.pubModel.countDocuments(filtro),
    ]);

    return {
      // items: items.map((it: any) => ({
      //   ...this.sanitizar(it),
      //   comentarios: Array.isArray(it?.comentarios) ? it.comentarios : [],
      //   likedBy: Array.isArray(it?.likedBy) ? it.likedBy : [],
      //   likesCount: Number.isFinite(it?.likesCount) ? it.likesCount : 0,
      // })),
       items: items.map((it: any) => {
    const sane = this.sanitizar(it);
    return { ...sane, _id: sane._id ? String(sane._id) : String(it._id) };
     }),
      total,
      offset,
      limit,
    };
  }

  // =========================================================
  // Baja lógica (solo autor o admin)
  // =========================================================
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
      throw new ForbiddenException('No autorizado para eliminar esta publicación.');
    }

    pub.habilitado = false;
    await pub.save();
    return { ok: true };
  }

  // =========================================================
  // Like / Unlike
  // =========================================================
  async like(publicacionId: string, usuario: { correo: string }) {
    const actualizado = await this.pubModel.findOneAndUpdate(
      { _id: publicacionId, habilitado: true, likedBy: { $ne: usuario.correo } },
      { $addToSet: { likedBy: usuario.correo }, $inc: { likesCount: 1 } },
      { new: true },
    );
    if (!actualizado) return { alreadyLiked: true };
    return this.sanitizar(actualizado);
  }

  async unlike(publicacionId: string, usuario: { correo: string }) {
    const actualizado = await this.pubModel.findOneAndUpdate(
      { _id: publicacionId, habilitado: true, likedBy: usuario.correo },
      { $pull: { likedBy: usuario.correo }, $inc: { likesCount: -1 } },
      { new: true },
    );
    if (!actualizado) return { notLiked: true };
    return this.sanitizar(actualizado);
  }

  // =========================================================
  // Comentarios (guarda snapshot del autor con fotoUrl)
  // =========================================================
  async addComment(
    publicacionId: string,
    autor: UsuarioJwtSnap, // 👈 ahora con fotoUrl
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
              fotoUrl: autor.fotoUrl, // 👈 persistimos fotoUrl
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

  // =========================================================
  // Utilidad: limpiar campos internos
  // =========================================================
  // private sanitizar = (doc: any) => {
  //   if (!doc) return doc;
  //   const plain = doc.toObject ? doc.toObject() : doc;
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   const { __v, ...resto } = plain;
  //   return resto;
  // };
  private sanitizar = (doc: any) => {
  if (!doc) return doc;
  const plain = doc.toObject ? doc.toObject() : doc;
  const { __v, ...resto } = plain;
  // 👇 clave: _id como string consistente
  return { ...resto, _id: resto?._id ? String(resto._id) : undefined };
};
}
