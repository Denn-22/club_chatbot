import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ClubsModule } from './clubs/clubs.module';
import { AiModule } from './ai/ai.module';
import { ImagesModule } from './images/images.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/almanakklub',
    ),
    ClubsModule,
    AiModule,
    ImagesModule,
  ],
})
export class AppModule {}
