import { IsIn, IsMongoId, IsInt, Min, IsOptional } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ListPublicacionesDto {
  @IsOptional()
  @IsIn(['fecha', 'likes'])
  @Transform(({ value, obj }) => (value ?? obj.sort ?? 'fecha'), { toClassOnly: true })
  sortBy?: 'fecha' | 'likes' = 'fecha';

  @IsOptional()
  @IsIn(['fecha', 'likes'])
  sort?: 'fecha' | 'likes';

  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Transform(({ value, obj }) => {
    const limit = Number.isFinite(+obj.limit) ? +obj.limit : 10;
    const page  = Number.isFinite(+obj.page)  ? +obj.page  : undefined;
    if (page && page > 0) return (page - 1) * limit;
    return Number.isFinite(+value) ? +value : 0;
  }, { toClassOnly: true })
  offset?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
