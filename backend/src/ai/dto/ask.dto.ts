import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({ enum: ['user', 'ai'] })
  @IsIn(['user', 'ai'])
  role: 'user' | 'ai';

  @ApiProperty()
  @IsString()
  @MaxLength(4000)
  text: string;
}

export class AskDto {
  @ApiProperty({
    example: 'Siapa pelatih Persija Jakarta?',
    description: 'Pertanyaan seputar dataset klub',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  question: string;

  @ApiPropertyOptional({
    type: [ChatMessageDto],
    description: 'Riwayat percakapan sebelumnya (untuk konteks)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  history?: ChatMessageDto[];
}
