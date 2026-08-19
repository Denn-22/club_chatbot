import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from 'minio';
import { extname } from 'path';

@Injectable()
export class ImagesService implements OnModuleInit {
  private readonly logger = new Logger(ImagesService.name);
  private client: Client;
  private bucket = process.env.MINIO_BUCKET || 'club-images';

  onModuleInit() {
    this.client = new Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000', 10),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });
    this.ensureBucket().catch((e) =>
      this.logger.warn(`MinIO belum siap: ${e.message}`),
    );
  }

  private async ensureBucket() {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) await this.client.makeBucket(this.bucket);
  }

  async upload(clubId: string, file: Express.Multer.File): Promise<string> {
    await this.ensureBucket();
    const objectName = `${clubId}${extname(file.originalname) || '.png'}`;
    await this.client.putObject(
      this.bucket,
      objectName,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );
    // URL lewat endpoint API sendiri agar MinIO tidak perlu diekspos publik
    return `/api/images/${objectName}`;
  }

  async getObject(objectName: string) {
    const stat = await this.client.statObject(this.bucket, objectName);
    const stream = await this.client.getObject(this.bucket, objectName);
    return { stream, contentType: stat.metaData['content-type'] };
  }
}
