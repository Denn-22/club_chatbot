// Seed dataset_club.json -> MongoDB
// Jalankan: npm run seed  (atau otomatis lewat docker-compose service "seed")
import { readFileSync } from 'fs';
import { resolve } from 'path';
import mongoose from 'mongoose';

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/almanakklub';
const DATASET =
  process.env.DATASET_PATH ||
  resolve(__dirname, '../../../datasetclub/dataset_club.json');

async function main() {
  const raw = JSON.parse(readFileSync(DATASET, 'utf-8')) as any[];
  const docs = raw.map(({ _id, ...rest }) => rest); // buang $oid lama

  await mongoose.connect(MONGO_URI);
  const col = mongoose.connection.collection('clubs');

  let upserted = 0;
  for (const doc of docs) {
    const res = await col.updateOne(
      { id: doc.id },
      { $set: doc },
      { upsert: true },
    );
    if (res.upsertedCount) upserted++;
  }
  console.log(
    `Seed selesai: ${docs.length} klub diproses, ${upserted} baru ditambahkan.`,
  );
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error('Seed gagal:', e.message);
  process.exit(1);
});
