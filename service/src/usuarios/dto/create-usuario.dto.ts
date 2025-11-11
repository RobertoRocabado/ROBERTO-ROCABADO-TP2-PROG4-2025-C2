import { IsEmail, IsOptional, IsString, MinLength, Matches, IsDateString, IsIn, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

const SOLO_LETRAS_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const PASS_REGEX = /^(?=.*\d)[A-Z][A-Za-z\d@$!%*?&]{7,}$/;

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  @Matches(SOLO_LETRAS_REGEX, { message: 'El nombre solo admite letras y espacios' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @Matches(SOLO_LETRAS_REGEX, { message: 'El apellido solo admite letras y espacios' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  apellido: string;

  @IsEmail()
  @Transform(({ value }) =>
    (typeof value === 'string' ? value.trim().toLowerCase() : value))
  correo: string;

  @IsString()
  @MinLength(4)
  @Transform(({ value }) =>
    (typeof value === 'string' ? value.trim().toLowerCase() : value))
  username: string;

  @IsString()
  @Matches(PASS_REGEX, {
    message:
      'La contraseña debe empezar con MAYÚSCULA, tener al menos 8 caracteres y contener al menos un número',
  })
  password: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsIn(['usuario', 'administrador'])
  rol?: 'usuario' | 'administrador';

  @IsOptional()
  @IsString()
  fotoUrl?: string;

  @IsOptional()
  @IsString()
  storagePath?: string;
}