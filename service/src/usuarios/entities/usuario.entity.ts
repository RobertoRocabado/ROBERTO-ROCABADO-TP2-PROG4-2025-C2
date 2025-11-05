import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UsuarioDocument = Usuario & Document;

export enum Rol { USUARIO='usuario', ADMIN='administrador' }

@Schema({ timestamps: true })
export class Usuario {
  @Prop({ required: true, match: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/ }) nombre: string;
  @Prop({ required: true, match: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/ }) apellido: string;
  @Prop({ required: true, unique: true, lowercase: true }) correo: string;
  @Prop({ required: true, unique: true, lowercase: true }) username: string;
  @Prop({ required: true }) password: string;
  @Prop() descripcion?: string;
  @Prop() fechaNacimiento?: Date;
  @Prop() fotoUrl?: string;
  @Prop({ enum: Rol, default: Rol.USUARIO }) rol: Rol;
  @Prop({ default: true }) habilitado: boolean; 
//   @Prop({ type: String, required: false, default: null})
// fotoUrl?: string | null;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);

