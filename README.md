# AlmanakKlub — Fullstack Tugas

Dataset explorer klub sepak bola divisi 1 & 2, sesuai spesifikasi tugas:

| Spesifikasi | Implementasi |
|---|---|
| Database | **MongoDB** (koleksi `clubs`) |
| RESTful API + Swagger | **NestJS** — dokumentasi di `/docs` |
| Web FE | **Next.js** (App Router + Tailwind) |
| Penyimpanan gambar | **MinIO** (upload logo klub) |
| AI | Proxy ke `https://ollama.if.unismuh.ac.id/api/generate` |
| Docker | `docker-compose.yml` (mongo, minio, api, web, seed) |
| GitHub Codespace | `.devcontainer/devcontainer.json` |

## Menjalankan dengan Docker (disarankan)

```bash
docker compose up --build
```

Layanan yang tersedia:

- Web FE → http://localhost:3000
- API → http://localhost:4000/api
- Swagger → http://localhost:4000/docs
- MinIO Console → http://localhost:9001 (user/pass: `minioadmin`)

Dataset di-seed otomatis dari `datasetclub/dataset_club.json` oleh service `seed`.

## Menjalankan manual (development)

Butuh MongoDB dan MinIO jalan lokal (bisa via `docker compose up mongo minio`).

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run seed        # isi database dari dataset
npm run start:dev   # http://localhost:4000/docs

# Frontend (terminal lain)
cd frontend
npm install
npm run dev         # http://localhost:3000
```

## Endpoint utama

- `GET /api/clubs` — daftar klub (`?search=&country=&division=&sort=`)
- `GET /api/clubs/stats` — statistik dataset
- `GET /api/clubs/:id` — detail klub
- `POST /api/clubs` · `PATCH /api/clubs/:id` · `DELETE /api/clubs/:id`
- `POST /api/clubs/:id/image` — upload logo ke MinIO (multipart `file`)
- `GET /api/images/:objectName` — ambil gambar dari MinIO
- `POST /api/ai/ask` — tanya Komentator AI (`{ "question": "..." }`)

## GitHub Codespaces

Buka repo di Codespaces — devcontainer akan menginstal dependency otomatis.
Lalu jalankan `docker compose up --build` di terminal Codespace.
