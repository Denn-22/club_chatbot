import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { randomUUID } from 'crypto';
import { Club, ClubDocument } from './club.schema';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { QueryClubDto } from './dto/query-club.dto';

@Injectable()
export class ClubsService {
  constructor(
    @InjectModel(Club.name) private readonly model: Model<ClubDocument>,
  ) {}

  async findAll(query: QueryClubDto) {
    const filter: FilterQuery<ClubDocument> = {};
    if (query.country) filter.country = query.country;
    if (query.division) filter.division = query.division;
    if (query.search) {
      const rx = new RegExp(
        query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i',
      );
      filter.$or = [
        { club: rx },
        { nickname: rx },
        { coach: rx },
        { 'stadium.name': rx },
        { 'stadium.city': rx },
        { league: rx },
      ];
    }
    const sortMap: Record<string, any> = {
      club: { club: 1 },
      capacity: { 'stadium.capacity': -1 },
      founded: { founded: 1 },
      trophies: null, // handled below via aggregation-free sort
    };
    let docs = await this.model
      .find(filter, { _id: 0 })
      .sort(sortMap[query.sort || 'club'] || { club: 1 })
      .lean();
    if (query.sort === 'trophies') {
      const total = (c: Club) =>
        (c.trophies?.liga_domestik || 0) +
        (c.trophies?.piala_domestik || 0) +
        (c.trophies?.internasional || 0);
      docs = docs.sort((a, b) => total(b) - total(a));
    }
    return docs;
  }

  async stats() {
    const [total, countries, leagues] = await Promise.all([
      this.model.countDocuments(),
      this.model.distinct('country'),
      this.model.distinct('league'),
    ]);
    return {
      total,
      countries: countries.sort(),
      leagues: leagues.sort(),
    };
  }

  async findOne(id: string) {
    const doc = await this.model.findOne({ id }, { _id: 0 }).lean();
    if (!doc) throw new NotFoundException(`Klub dengan id ${id} tidak ada`);
    return doc;
  }

  async create(dto: CreateClubDto) {
    const created = await this.model.create({ ...dto, id: randomUUID() });
    const { _id, ...rest } = created.toObject();
    return rest;
  }

  async update(id: string, dto: UpdateClubDto) {
    const doc = await this.model
      .findOneAndUpdate({ id }, dto, { new: true, projection: { _id: 0 } })
      .lean();
    if (!doc) throw new NotFoundException(`Klub dengan id ${id} tidak ada`);
    return doc;
  }

  async setImage(id: string, imageUrl: string) {
    const doc = await this.model
      .findOneAndUpdate(
        { id },
        { imageUrl },
        { new: true, projection: { _id: 0 } },
      )
      .lean();
    if (!doc) throw new NotFoundException(`Klub dengan id ${id} tidak ada`);
    return doc;
  }

  async remove(id: string) {
    const res = await this.model.deleteOne({ id });
    if (res.deletedCount === 0)
      throw new NotFoundException(`Klub dengan id ${id} tidak ada`);
    return { deleted: true };
  }
}
