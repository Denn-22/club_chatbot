"use client";

import { useEffect, useState } from "react";
import { isFavorit, toggleFavorit } from "@/lib/storage";

// Tombol favorit: menyimpan/menghapus id kos dari localStorage.
export default function FavoritButton({ id, className = "" }) {
  const [fav, setFav] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setFav(isFavorit(id));
    setMounted(true);
  }, [id]);

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleFavorit(id);
    setFav(next.includes(id));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`favorit-btn ${fav ? "active" : ""} ${className}`}
      aria-label={fav ? "Hapus dari favorit" : "Tambah ke favorit"}
      title={fav ? "Hapus dari favorit" : "Tambah ke favorit"}
      data-testid="favorit-btn"
      suppressHydrationWarning
    >
      {mounted && fav ? "♥" : "♡"}
    </button>
  );
}
