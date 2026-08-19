import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ClubsService } from '../clubs/clubs.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly url =
    process.env.OLLAMA_URL || 'https://ollama.if.unismuh.ac.id/api/generate';
  private readonly model = process.env.OLLAMA_MODEL || 'llama3.2';

  constructor(private readonly clubs: ClubsService) {}

  async ask(question: string, history: { role: string; text: string }[] = []) {
    // Konteks ringkas dari dataset agar jawaban AI akurat (RAG sederhana).
    // Dataset bisa ribuan klub, jadi hanya kirim klub yang relevan dengan pertanyaan.
    const clubs = await this.clubs.findAll({});
    // Gabungkan pertanyaan + riwayat percakapan terakhir agar pertanyaan lanjutan
    // seperti "berapa kali dia juara?" tetap mengarah ke klub yang sedang dibahas.
    const recentHistory = (history || []).slice(-6);
    const searchText = [
      question,
      ...recentHistory.map((m) => m.text),
    ].join(' ');
    // Stopword umum (Indonesia + Inggris) agar kata seperti "yang", "liga",
    // "klub" tidak membuat klub yang salah ikut terpilih.
    const stopwords = new Set([
      'yang', 'dan', 'atau', 'dia', 'ini', 'itu', 'ada', 'adalah', 'dengan',
      'untuk', 'dari', 'dalam', 'pada', 'juga', 'saja', 'kali', 'berapa',
      'berapakali', 'siapa', 'apa', 'mana', 'kapan', 'bagaimana', 'kenapa',
      'klub', 'tim', 'liga', 'juara', 'pemain', 'pelatih', 'stadion', 'bola',
      'sepak', 'sepakbola', 'legenda', 'sejarah', 'sangat', 'telah', 'sudah',
      'akan', 'bisa', 'banyak', 'paling', 'sebagai', 'salah', 'satu', 'tidak',
      'the', 'and', 'club', 'team', 'league', 'city', 'united', 'real',
    ]);
    const tokens = [
      ...new Set(
        searchText
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((t) => t.length >= 3 && !stopwords.has(t)),
      ),
    ];
    // Skor per klub: cocokkan per-kata utuh (bukan substring), nama klub
    // berbobot lebih besar daripada atribut lain. Urutkan dari skor tertinggi.
    const wordsOf = (s: string) =>
      new Set(s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
    const scored = (clubs as any[])
      .map((c) => {
        const nameWords = wordsOf(`${c.club} ${c.nickname || ''}`);
        const attrWords = wordsOf(
          `${c.country} ${c.league} ${c.coach} ${c.stadium?.name} ${c.stadium?.city} ${(c.key_players || []).join(' ')}`,
        );
        let score = 0;
        for (const t of tokens) {
          if (nameWords.has(t)) score += 5;
          else if (attrWords.has(t)) score += 1;
        }
        return { club: c, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);
    // Ambil hanya klub dengan skor terbaik (dan yang mendekati) agar konteks fokus.
    const topScore = scored[0]?.score ?? 0;
    const matches = scored
      .filter((x) => x.score >= Math.max(1, topScore * 0.5))
      .map((x) => x.club);
    // maksimal 60 klub sebagai konteks; kalau tidak ada yang cocok, kirim ringkasan umum
    const selected = (matches.length ? matches : (clubs as any[])).slice(0, 60);
    const summary = `Total ${clubs.length} klub dalam dataset dari negara: ${[...new Set((clubs as any[]).map((c) => c.country))].join(', ')}.`;
    const context = selected
      .map(
        (c: any) =>
          `${c.club} (${c.nickname || '-'}) | ${c.country} | ${c.league} div ${c.division} | berdiri ${c.founded} | stadion ${c.stadium?.name}, ${c.stadium?.city}, kapasitas ${c.stadium?.capacity} | pelatih ${c.coach} | trofi liga ${c.trophies?.liga_domestik}, piala ${c.trophies?.piala_domestik}, internasional ${c.trophies?.internasional} | rival ${c.rival || '-'}`,
      )
      .join('\n');

    const historyBlock = recentHistory.length
      ? `\nRIWAYAT PERCAKAPAN (untuk konteks kata ganti seperti "dia", "klub itu"):\n${recentHistory
          .map((m) => `${m.role === 'user' ? 'Pengguna' : 'Kamu'}: ${m.text}`)
          .join('\n')}\n`
      : '';

    const prompt = `Kamu adalah "Komentator AI", asisten sekaligus komentator sepak bola berbahasa Indonesia yang antusias, ramah, dan akurat.
ATURAN:
1. Jawab SEMUA pertanyaan pengguna, apa pun topiknya (sepak bola, pengetahuan umum, hitungan, dll).
2. Jika pertanyaan berkaitan dengan klub yang ada di DATA KLUB di bawah, utamakan dan gunakan data tersebut agar jawaban akurat.
3. Jika pertanyaan memakai kata ganti ("dia", "mereka", "klub itu"), lihat RIWAYAT PERCAKAPAN untuk tahu siapa/apa yang dimaksud. JANGAN menebak klub lain yang tidak sedang dibahas.
4. Jika pertanyaan tidak berkaitan dengan data, jawab menggunakan pengetahuan umummu dengan percaya diri.
5. Jika data tidak memuat jawabannya dan kamu tidak yakin, katakan dengan jujur bahwa datanya tidak tersedia — jangan mengarang angka.

RINGKASAN DATASET: ${summary}
${historyBlock}
DATA KLUB (yang relevan dengan pertanyaan):
${context}

PERTANYAAN: ${question}

Jawab singkat, jelas, dalam bahasa Indonesia:`;

    try {
      const res = await fetch(this.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
        }),
      });
      if (!res.ok) {
        const detail = (await res.text()).slice(0, 300);
        throw new Error(`HTTP ${res.status}: ${detail}`);
      }
      const data = (await res.json()) as { response?: string };
      const answer = data.response?.trim();
      if (!answer) {
        return {
          answer:
            'Maaf, aku belum bisa merumuskan jawaban untuk itu. Coba tanyakan dengan kalimat lain ya!',
        };
      }
      return { answer };
    } catch (e: any) {
      this.logger.error(`Gagal menghubungi Ollama: ${e.message}`);
      // Fallback: tetap beri jawaban dari dataset agar chatbot selalu merespons.
      const fallback = this.answerFromDataset(question, matches, summary);
      if (fallback) return { answer: fallback };
      throw new BadGatewayException(
        `Gagal menghubungi server AI: ${e.message}`,
      );
    }
  }

  /** Jawaban darurat dari dataset kalau server AI tidak bisa dihubungi. */
  private answerFromDataset(
    question: string,
    matches: any[],
    summary: string,
  ): string | null {
    if (!matches.length) {
      return `Server AI sedang tidak bisa dihubungi, tapi ini info dataset kami: ${summary} Coba tanyakan nama klub tertentu ya!`;
    }
    const lines = matches.slice(0, 5).map((c: any) => {
      return `⚽ ${c.club} (${c.nickname || '-'}) — ${c.league}, ${c.country}. Berdiri ${c.founded}, kandang di ${c.stadium?.name} (${c.stadium?.city}, kapasitas ${c.stadium?.capacity}). Pelatih: ${c.coach}. Trofi: ${c.trophies?.liga_domestik} liga, ${c.trophies?.piala_domestik} piala domestik, ${c.trophies?.internasional} internasional.${c.rival ? ` Rival: ${c.rival}.` : ''}`;
    });
    return `Server AI sedang sibuk, jadi aku jawab langsung dari data:\n\n${lines.join('\n\n')}`;
  }
}
