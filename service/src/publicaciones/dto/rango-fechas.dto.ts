import { IsISO8601, IsOptional } from 'class-validator';

export class RangoFechasDto {
  @IsOptional()
  @IsISO8601()
  fechaInicio?: string; 

  @IsOptional()
  @IsISO8601()
  fechaFin?: string;
}
