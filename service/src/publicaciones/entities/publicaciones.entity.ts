// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { HydratedDocument } from 'mongoose';

// @Schema({ _id: false })
// class UsuarioPublicacion {
//   @Prop({ required: true }) nombre: string;
//   @Prop({ required: true }) apellido: string;
//   @Prop({ required: true }) correo: string;
//   @Prop({ required: true }) rol: string;
//   @Prop({ required: true }) fotoUrl: string;
// }
// const UsuarioPublicacionSchema = SchemaFactory.createForClass(UsuarioPublicacion);

// // ---------------------- Comentarios ------------------------
// @Schema({ _id: true})
// class Comentario {
//   @Prop({ type: UsuarioPublicacionSchema, required: true })
//   autor: UsuarioPublicacion;

//   @Prop({ type: String, required: true, trim: true })
//   texto: string;

//   // default para evitar nulls
//   @Prop({ type: Date, required: true, default: () => new Date() })
//   createdAt: Date;
// }
// const ComentarioSchema = SchemaFactory.createForClass(Comentario);
// // ------------------------------------------------------------

// @Schema({
//   collection: 'publicaciones',
//   timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
// })
// export class Publicacion {
//   @Prop({ type: UsuarioPublicacionSchema, required: true })
//   usuario: UsuarioPublicacion;

//   @Prop({ required: true }) titulo: string;
//   @Prop({ required: true }) descripcion: string;

//   @Prop({ type: String, default: null }) imagenUrl?: string | null;

//   @Prop({ type: Boolean, default: true }) habilitado: boolean;

//   @Prop({ type: Number, default: 0 }) likesCount: number;

//   @Prop({ type: [String], default: [] }) likedBy: string[];

//   // 👇 usa el schema de Comentario + default []
//   @Prop({ type: [ComentarioSchema], default: [] })
//   comentarios: Comentario[];
// }

// export type PublicacionDocument = HydratedDocument<Publicacion>;
// export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);

//==================================================

// publicaciones.entity.ts
import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';

@Schema({ _id: true, strict: false })
class UsuarioSnapshot {} // sin definición de campos

const UsuarioSnapshotSchema = new mongoose.Schema({}, { _id: false, strict: false });

@Schema({
  collection: 'publicaciones',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})
export class Publicacion {
  @Prop({ type: UsuarioSnapshotSchema, required: true })
  usuario: Record<string, any>;
  @Prop({ required: true }) titulo: string;
  @Prop({ required: true }) descripcion: string;
  @Prop({ type: String, default: null }) imagenUrl?: string | null;
  @Prop({ type: Boolean, default: true }) habilitado: boolean;
  @Prop({ type: Number, default: 0 }) likesCount: number;
  @Prop({ type: [String], default: [] }) likedBy: string[];

  @Prop({
    type: [new mongoose.Schema({
      autor: { type: UsuarioSnapshotSchema, required: true },
      texto: { type: String, required: true, trim: true },
      createdAt: { type: Date, required: true, default: () => new Date() },
    }, { _id: true })],
    default: []
  })
  comentarios: Array<{
    autor: Record<string, any>;
    texto: string;
    createdAt: Date;
  }>;
}

export type PublicacionDocument = HydratedDocument<Publicacion>;
export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
