import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { QueryClubDto } from './dto/query-club.dto';
import { ImagesService } from '../images/images.service';

@ApiTags('clubs')
@Controller('clubs')
export class ClubsController {
  constructor(
    private readonly clubs: ClubsService,
    private readonly images: ImagesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Daftar klub (filter, cari, urutkan)' })
  findAll(@Query() query: QueryClubDto) {
    return this.clubs.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistik dataset (total, negara, liga)' })
  stats() {
    return this.clubs.stats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail satu klub' })
  findOne(@Param('id') id: string) {
    return this.clubs.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tambah klub baru' })
  create(@Body() dto: CreateClubDto) {
    return this.clubs.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Ubah data klub' })
  update(@Param('id') id: string, @Body() dto: UpdateClubDto) {
    return this.clubs.update(id, dto);
  }

  @Post(':id/image')
  @ApiOperation({ summary: 'Upload gambar/logo klub ke MinIO' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('File gambar wajib diisi');
    if (!file.mimetype.startsWith('image/'))
      throw new BadRequestException('Hanya file gambar yang diperbolehkan');
    await this.clubs.findOne(id); // pastikan klub ada
    const url = await this.images.upload(id, file);
    return this.clubs.setImage(id, url);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus klub' })
  remove(@Param('id') id: string) {
    return this.clubs.remove(id);
  }
}
