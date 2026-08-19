import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class StadiumDto {
  @ApiProperty({ example: 'Jakarta International Stadium' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Jakarta' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 82000 })
  @IsInt()
  @Min(0)
  capacity: number;
}

export class TrophiesDto {
  @ApiProperty({ example: 11 })
  @IsInt()
  @Min(0)
  liga_domestik: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  piala_domestik: number;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  internasional: number;
}

export class CreateClubDto {
  @ApiProperty({ example: 'Persija Jakarta' })
  @IsString()
  @IsNotEmpty()
  club: string;

  @ApiProperty({ example: 'Indonesia' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: 'Super League (Liga 1)' })
  @IsString()
  @IsNotEmpty()
  league: string;

  @ApiProperty({ example: 1, description: 'Divisi 1 atau 2' })
  @IsInt()
  division: number;

  @ApiProperty({ example: 1928 })
  @IsInt()
  founded: number;

  @ApiProperty({ type: StadiumDto })
  @ValidateNested()
  @Type(() => StadiumDto)
  stadium: StadiumDto;

  @ApiProperty({ example: 'Carlos Pena' })
  @IsString()
  @IsNotEmpty()
  coach: string;

  @ApiProperty({ type: [String], example: ['Witan Sulaeman', 'Rizky Ridho'] })
  @IsArray()
  @IsString({ each: true })
  key_players: string[];

  @ApiProperty({ type: TrophiesDto })
  @ValidateNested()
  @Type(() => TrophiesDto)
  trophies: TrophiesDto;

  @ApiPropertyOptional({ example: 'Macan Kemayoran' })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({ example: 'Persib Bandung' })
  @IsOptional()
  @IsString()
  rival?: string;
}
