import { IsOptional, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreatePublicacionDto {
  @IsString() @IsNotEmpty() @MaxLength(140) titulo: string;
  @IsString() @IsNotEmpty() @MaxLength(2000) descripcion: string;
  @IsOptional() @IsString() imageUrl?: string; // por si mandan URL directa (no común)
}
