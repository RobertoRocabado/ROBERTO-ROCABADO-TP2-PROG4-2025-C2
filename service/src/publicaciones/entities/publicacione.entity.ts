import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PublicacionDocument = Publicacion & Document;

@Schema({ timestamps: true })
export class Publicacion {
  @Prop({ required: true }) titulo: string;
  @Prop({ required: true }) mensaje: string;
  @Prop() imagenUrl?: string;
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true }) usuarioId: Types.ObjectId;
  @Prop({ default: [] }) meGustaDe: string[]; 
  @Prop({ default: true }) activa: boolean;
  @Prop({ default: 0 }) guardadaCount: number;
  @Prop({ default: 0 }) compartidaCount: number;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);

@Schema({ timestamps: true })
export class Comentario {
  @Prop({ type: Types.ObjectId, ref: 'Publicacion', required: true }) publicacionId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true }) usuarioId: Types.ObjectId;
  @Prop({ required: true }) mensaje: string;
  @Prop({ default: false }) modificado: boolean;
}

export type ComentarioDocument = Comentario & Document;
export const ComentarioSchema = SchemaFactory.createForClass(Comentario);
