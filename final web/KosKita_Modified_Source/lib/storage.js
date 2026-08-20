// lib/storage.js
// Utilitas manajemen state client-side untuk KosKita.
// - localStorage : daftar kos favorit (persisten lintas sesi & tab)
// - sessionStorage: filter pencarian aktif (hanya berlaku selama tab terbuka)
// - Cookie        : preferensi kota terakhir dicari (persisten, expiry 30 hari)

const LS_FAVORIT_KEY = "koskita_favorit";
const SS_FILTER_KEY = "koskita_filter";
const COOKIE_KOTA_KEY = "koskita_kota_preferensi";

/* ---------------- localStorage: Kos Favorit ---------------- */
export function getFavorit() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_FAVORIT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Gagal membaca localStorage favorit:", e);
    return [];
  }
}

export function isFavorit(id) {
  return getFavorit().includes(id);
}

export function toggleFavorit(id) {
  const current = getFavorit();
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
  localStorage.setItem(LS_FAVORIT_KEY, JSON.stringify(next));
  return next;
}

/* ---------------- sessionStorage: Filter Pencarian ---------------- */
export function saveFilterSession(filter) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SS_FILTER_KEY, JSON.stringify(filter));
}

export function loadFilterSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SS_FILTER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Gagal membaca sessionStorage filter:", e);
    return null;
  }
}

/* ---------------- Cookie: Preferensi Kota ---------------- */
export function setCookie(name, value, days) {
  const expires = days
    ? `; expires=${new Date(Date.now() + days * 864e5).toUTCString()}`
    : "";
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`;
}

export function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export function saveKotaPreferensi(kota) {
  if (kota) setCookie(COOKIE_KOTA_KEY, kota, 30);
}

export function getKotaPreferensi() {
  return getCookie(COOKIE_KOTA_KEY);
}

export const KEYS = { LS_FAVORIT_KEY, SS_FILTER_KEY, COOKIE_KOTA_KEY };
