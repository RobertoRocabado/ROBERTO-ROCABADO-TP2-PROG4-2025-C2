import { IsEmail, IsOptional, IsString, MinLength, Matches, IsDateString } from 'class-validator';

export class CreateUsuarioDto {
  @IsString() nombre: string;
  @IsString() apellido: string;
  @IsEmail()  correo: string;
  @IsString() username: string;

  @MinLength(8)
  @Matches(/(?=.*[A-Z])(?=.*\d)/, { message: 'Debe tener mayúscula y número' })
  password: string;

  @IsOptional() @IsString() descripcion?: string;
  @IsOptional() @IsDateString() fechaNacimiento?: string;
  @IsOptional() @IsString() rol?: 'usuario' | 'administrador';

  @IsOptional() @IsString() fotoUrl?: string;
  @IsOptional() @IsString() storagePath?: string;
}
