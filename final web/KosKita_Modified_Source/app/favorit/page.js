"use client";

import { useEffect, useState } from "react";
import KosCard from "@/components/KosCard";
import { kosList } from "@/lib/data";
import { getFavorit } from "@/lib/storage";

// Halaman ini murni bergantung pada localStorage (tidak ada data dari
// server), sehingga menjadi contoh nyata state yang sepenuhnya dikelola
// di sisi klien.
export default function FavoritPage() {
  const [ids, setIds] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIds(getFavorit());
    setMounted(true);
  }, []);

  const favoritKos = kosList.filter((k) => ids.includes(k.id));

  return (
    <>
      <h1 className="section-title">Kos Favorit</h1>
      {!mounted ? null : favoritKos.length === 0 ? (
        <div className="status-info" data-testid="favorit-empty">
          Belum ada kos favorit. Tandai kos dengan ikon ♡ pada halaman
          pencarian, lalu kembali ke sini.
        </div>
      ) : (
        <div className="kos-grid" data-testid="favorit-grid">
          {favoritKos.map((kos) => (
            <KosCard key={kos.id} kos={kos} />
          ))}
        </div>
      )}
    </>
  );
}
