import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class Stadium {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) city: string;
  @Prop({ required: true }) capacity: number;
}

@Schema({ _id: false })
export class Trophies {
  @Prop({ default: 0 }) liga_domestik: number;
  @Prop({ default: 0 }) piala_domestik: number;
  @Prop({ default: 0 }) internasional: number;
}

@Schema({ collection: 'clubs', versionKey: false })
export class Club {
  @Prop({ required: true, unique: true, index: true }) id: string;
  @Prop({ required: true }) club: string;
  @Prop({ required: true, index: true }) country: string;
  @Prop({ required: true }) league: string;
  @Prop({ required: true, index: true }) division: number;
  @Prop({ required: true }) founded: number;
  @Prop({ type: Stadium, required: true }) stadium: Stadium;
  @Prop({ required: true }) coach: string;
  @Prop({ type: [String], default: [] }) key_players: string[];
  @Prop({ type: Trophies, default: {} }) trophies: Trophies;
  @Prop() nickname: string;
  @Prop() rival: string;
  @Prop() imageUrl?: string;
}

export type ClubDocument = HydratedDocument<Club>;
export const ClubSchema = SchemaFactory.createForClass(Club);
