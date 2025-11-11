import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';

@Schema({ _id: true, strict: false })
class UsuarioSnapshot {}

const UsuarioSnapshotSchema = new mongoose.Schema(
  {},
  {
    _id: false,
    strict: false,
  },
);

@Schema({
  collection: 'publicaciones',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class Publicacion {
  @Prop({ type: UsuarioSnapshotSchema, required: true })
  usuario: Record<string, any>;

  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ type: String, default: null })
  imagenUrl?: string | null;

  @Prop({ type: Boolean, default: true })
  habilitado: boolean;

  @Prop({ type: Number, default: 0 })
  likesCount: number;

  @Prop({ type: [String], default: [] })
  likedBy: string[];

  @Prop({
    type: [
      new mongoose.Schema(
        {
          autor: { type: UsuarioSnapshotSchema, required: true },
          texto: { type: String, required: true, trim: true },
          createdAt: {
            type: Date,
            required: true,
            default: () => new Date(),
          },
          modificado: { type: Boolean, default: false },
          updatedAt: { type: Date, default: null },
        },
        { _id: true },
      ),
    ],
    default: [],
  })
  comentarios: Array<{
    autor: Record<string, any>;
    texto: string;
    createdAt: Date;
    modificado?: boolean | null;
    updatedAt?: Date | null;
  }>;
}

export type PublicacionDocument = HydratedDocument<Publicacion>;
export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
