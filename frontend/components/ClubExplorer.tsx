'use client';

import { useCallback, useEffect, useState } from 'react';
import { Club, Stats, totalTrophies } from '@/lib/types';
import ClubModal from './ClubModal';
import ChatPanel from './ChatPanel';

export default function ClubExplorer() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [division, setDivision] = useState('');
  const [sort, setSort] = useState('club');
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<Club | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSeed, setChatSeed] = useState('');

  useEffect(() => {
    fetch('/api/clubs/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (country) params.set('country', country);
      if (division) params.set('division', division);
      if (sort) params.set('sort', sort);
      fetch(`/api/clubs?${params}`)
        .then((r) => r.json())
        .then((data) => {
          setClubs(Array.isArray(data) ? data : []);
          setError(false);
        })
        .catch(() => setError(true));
    }, 250);
    return () => clearTimeout(t);
  }, [search, country, division, sort]);

  const openRival = useCallback(
    (rivalName: string) => {
      fetch(`/api/clubs?search=${encodeURIComponent(rivalName)}`)
        .then((r) => r.json())
        .then((list: Club[]) => {
          const exact = list.find((c) => c.club === rivalName) || list[0];
          if (exact) setSelected(exact);
        })
        .catch(() => undefined);
    },
    [],
  );

  const askAboutClub = useCallback((c: Club) => {
    setSelected(null);
    setChatSeed(`Ceritakan tentang ${c.club}`);
    setChatOpen(true);
  }, []);

  return (
    <>
      {/* ================= MASTHEAD ================= */}
      <header className="sticky top-0 z-40 border-b-4 border-ink bg-paper/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 pt-5 pb-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] font-semibold tracking-[.25em] uppercase text-grass">
                Musim 2025/26 · Divisi 1 &amp; 2
              </p>
              <h1 className="font-display text-3xl sm:text-4xl leading-none mt-1">
                ALMANAK<span className="text-grass">KLUB</span>
              </h1>
            </div>
            <p className="font-mono text-xs text-ink/60 hidden sm:block">
              {stats
                ? `${stats.total} klub · ${stats.countries.length} negara · ${stats.leagues.length} liga — sumber: MongoDB`
                : 'memuat…'}
            </p>
          </div>
          <div className="flex flex-wrap w-full gap-2 mt-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Cari klub, stadion, pelatih…"
              className="flex-1 min-w-[220px] max-w-md bg-chalk border-2 border-ink px-4 py-2.5 text-sm placeholder-ink/40 shadow-hardSm focus:shadow-hard outline-none transition-shadow"
            />
            <select
              className="select"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="">Semua Negara</option>
              {stats?.countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              className="select"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
            >
              <option value="">Semua Divisi</option>
              <option value="1">Divisi 1</option>
              <option value="2">Divisi 2</option>
            </select>
            <select
              className="select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="club">Urut: Nama</option>
              <option value="capacity">Urut: Kapasitas Stadion</option>
              <option value="founded">Urut: Tahun Berdiri</option>
              <option value="trophies">Urut: Total Trofi</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ================= PAPAN SKOR ================= */}
        {(() => {
          const filtering = search || country || division;
          const shownCountries = new Set(clubs.map((c) => c.country)).size;
          const shownLeagues = new Set(clubs.map((c) => c.league)).size;
          return (
            <section className="bg-ink text-chalk border-2 border-ink shadow-hardLg mb-10 grid grid-cols-2 md:grid-cols-4 animate-fadeUp">
              <div className="score-cell">
                <p className="score-label">
                  {filtering ? 'Klub Cocok' : 'Total Klub'}
                </p>
                <p className="score-value">
                  {filtering ? clubs.length : stats?.total ?? '–'}
                </p>
              </div>
              <div className="score-cell">
                <p className="score-label">Negara</p>
                <p className="score-value">
                  {filtering ? shownCountries : stats?.countries.length ?? '–'}
                </p>
              </div>
              <div className="score-cell">
                <p className="score-label">Liga</p>
                <p className="score-value">
                  {filtering ? shownLeagues : stats?.leagues.length ?? '–'}
                </p>
              </div>
              <div className="score-cell md:!border-r-0">
                <p className="score-label">Ditampilkan</p>
                <p className="score-value !text-card">{clubs.length}</p>
              </div>
            </section>
          );
        })()}

        {/* ================= ERROR LOAD ================= */}
        {error && (
          <section className="bg-chalk border-2 border-ink shadow-hard p-8 text-center max-w-xl mx-auto mb-8">
            <p className="font-display text-2xl mb-2">DATA TIDAK TERBACA</p>
            <p className="text-sm text-ink/70">
              API tidak bisa dihubungi. Pastikan backend jalan (
              <code className="font-mono text-whistle">
                docker compose up
              </code>{' '}
              atau{' '}
              <code className="font-mono text-whistle">
                npm run start:dev
              </code>{' '}
              di folder backend).
            </p>
          </section>
        )}

        {/* ================= GRID STIKER KLUB ================= */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clubs.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className="text-left bg-chalk border-2 border-ink shadow-hard hover:shadow-hardLg hover:-translate-y-0.5 transition-all animate-fadeUp"
            >
              <div className="bg-grass text-chalk px-4 py-3 border-b-2 border-ink flex items-center gap-3">
                {c.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.imageUrl}
                    alt={c.club}
                    className="w-9 h-9 object-cover border-2 border-chalk bg-chalk"
                  />
                ) : (
                  <span className="text-2xl">⚽</span>
                )}
                <div className="min-w-0">
                  <p className="font-display text-sm uppercase truncate">
                    {c.club}
                  </p>
                  <p className="font-mono text-[10px] text-card truncate">
                    {c.nickname || c.league}
                  </p>
                </div>
              </div>
              <div className="px-4 py-3 space-y-1.5 text-sm">
                <p className="flex justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50 pt-0.5">
                    Negara
                  </span>
                  <span className="font-semibold text-right">{c.country}</span>
                </p>
                <p className="flex justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50 pt-0.5">
                    Stadion
                  </span>
                  <span className="font-semibold text-right truncate">
                    {c.stadium?.name}
                  </span>
                </p>
                <p className="flex justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50 pt-0.5">
                    Kapasitas
                  </span>
                  <span className="font-mono font-bold">
                    {c.stadium?.capacity?.toLocaleString('id-ID')}
                  </span>
                </p>
                <p className="flex justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50 pt-0.5">
                    Trofi
                  </span>
                  <span className="font-mono font-bold text-grass">
                    {totalTrophies(c)} 🏆
                  </span>
                </p>
              </div>
            </button>
          ))}
        </section>
        {!error && clubs.length === 0 && (
          <p className="text-center font-mono text-sm text-ink/50 py-16">
            — Tidak ada klub yang cocok dengan pencarian/filter —
          </p>
        )}
      </main>

      {selected && (
        <ClubModal
          club={selected}
          onClose={() => setSelected(null)}
          onOpenRival={openRival}
          onAsk={askAboutClub}
        />
      )}

      <ChatPanel
        open={chatOpen}
        seed={chatSeed}
        onToggle={() => setChatOpen((v) => !v)}
        statsLabel={
          stats
            ? `Hafal ${stats.total} klub · ${stats.countries.length} negara · ${stats.leagues.length} liga`
            : ''
        }
      />

      <footer className="border-t-4 border-ink mt-12">
        <p className="max-w-7xl mx-auto px-4 py-5 font-mono text-[11px] text-ink/50 text-center">
          ALMANAKKLUB — MongoDB · NestJS + Swagger · Next.js · MinIO · AI
          (Ollama) · Docker — dibuat untuk tugas kuliah
        </p>
      </footer>
    </>
  );
}
