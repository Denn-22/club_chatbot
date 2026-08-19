import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class QueryClubDto {
  @ApiPropertyOptional({ description: 'Cari nama klub/stadion/pelatih' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'Indonesia' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 1, enum: [1, 2] })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  division?: number;

  @ApiPropertyOptional({
    enum: ['club', 'capacity', 'founded', 'trophies'],
    default: 'club',
  })
  @IsOptional()
  @IsIn(['club', 'capacity', 'founded', 'trophies'])
  sort?: string;
}
