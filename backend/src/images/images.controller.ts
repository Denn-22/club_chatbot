import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ImagesService } from './images.service';

@ApiTags('images')
@Controller('images')
export class ImagesController {
  constructor(private readonly images: ImagesService) {}

  @Get(':objectName')
  @ApiOperation({ summary: 'Ambil gambar klub dari MinIO' })
  async get(@Param('objectName') objectName: string, @Res() res: Response) {
    // cegah path traversal
    if (objectName.includes('/') || objectName.includes('..'))
      throw new NotFoundException();
    try {
      const { stream, contentType } = await this.images.getObject(objectName);
      res.setHeader('Content-Type', contentType || 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      stream.pipe(res);
    } catch {
      throw new NotFoundException('Gambar tidak ditemukan');
    }
  }
}
