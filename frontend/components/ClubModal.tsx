'use client';

import { useRef, useState } from 'react';
import { Club } from '@/lib/types';

export default function ClubModal({
  club,
  onClose,
  onOpenRival,
  onAsk,
}: {
  club: Club;
  onClose: () => void;
  onOpenRival: (rival: string) => void;
  onAsk: (club: Club) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(club.imageUrl);

  async function upload(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`/api/clubs/${club.id}/image`, {
        method: 'POST',
        body: form,
      });
      if (res.ok) {
        const updated = (await res.json()) as Club;
        setImageUrl(`${updated.imageUrl}?t=${Date.now()}`);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-chalk border-2 border-ink shadow-hardLg max-w-lg w-full max-h-[88vh] overflow-y-auto scrollbar-thin animate-fadeUp">
        <div className="bg-grass text-chalk px-6 py-4 border-b-2 border-ink flex items-start gap-4">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={club.club}
              className="w-12 h-12 object-cover border-2 border-chalk bg-chalk mt-1"
            />
          ) : (
            <span className="text-4xl leading-none mt-1">⚽</span>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-2xl leading-tight uppercase">
              {club.club}
            </h2>
            <p className="font-mono text-xs mt-1 text-card">
              {club.nickname || '—'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="font-mono text-lg hover:text-card transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className="badge">{club.league}</span>
            <span className="badge">{club.country}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="stat-card">
              <p className="stat-label">Berdiri</p>
              <p className="stat-value font-mono">{club.founded}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Pelatih</p>
              <p className="stat-value text-base">{club.coach}</p>
            </div>
            <div className="stat-card col-span-2">
              <p className="stat-label">Stadion</p>
              <p className="stat-value text-base">
                {club.stadium?.name} — {club.stadium?.city} (
                {club.stadium?.capacity?.toLocaleString('id-ID')})
              </p>
            </div>
          </div>
          <div>
            <h3 className="section-title">Pemain Kunci</h3>
            <div className="flex flex-wrap gap-2">
              {club.key_players?.map((p) => (
                <span key={p} className="chip cursor-default">
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="section-title">Lemari Trofi</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="stat-card text-center">
                <p className="stat-label">Liga</p>
                <p className="stat-value font-mono">
                  {club.trophies?.liga_domestik ?? 0}
                </p>
              </div>
              <div className="stat-card text-center">
                <p className="stat-label">Piala</p>
                <p className="stat-value font-mono">
                  {club.trophies?.piala_domestik ?? 0}
                </p>
              </div>
              <div className="stat-card text-center">
                <p className="stat-label">Internasional</p>
                <p className="stat-value font-mono">
                  {club.trophies?.internasional ?? 0}
                </p>
              </div>
            </div>
          </div>
          {club.rival && (
            <div className="flex items-center gap-2 text-sm border-t-2 border-dashed border-ink/30 pt-4">
              <span className="font-mono text-xs uppercase tracking-wider text-whistle">
                Rival utama →
              </span>
              <button className="chip" onClick={() => onOpenRival(club.rival!)}>
                {club.rival}
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="bg-chalk text-ink font-display text-sm uppercase tracking-wide py-3 border-2 border-ink shadow-hardSm hover:bg-card transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
            >
              {uploading ? 'Mengunggah…' : 'Upload Logo (MinIO) ⬆'}
            </button>
            <button
              onClick={() => onAsk(club)}
              className="bg-ink text-chalk font-display text-sm uppercase tracking-wide py-3 border-2 border-ink shadow-hardSm hover:bg-grass hover:shadow-hard transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              Tanya Komentator AI ↗
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = '';
            }}
          />
        </div>
      </div>
    </div>
  );
}
