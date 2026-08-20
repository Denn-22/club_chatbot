"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import KosCard from "@/components/KosCard";
import {
  saveFilterSession,
  loadFilterSession,
  saveKotaPreferensi,
  getKotaPreferensi,
  getFavorit,
  KEYS,
} from "@/lib/storage";

export default function CariKosPage() {
  // Manajemen state dengan useState
  const [kosList, setKosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [kota, setKota] = useState("");
  const [tipe, setTipe] = useState("");
  const [maxHarga, setMaxHarga] = useState("");
  const [debugOpen, setDebugOpen] = useState(false);
  const [debugData, setDebugData] = useState({ ls: "", ss: "", cookie: "" });
  const initialized = useRef(false);
  const skipNextSessionSave = useRef(false);

  // Saat halaman pertama dimuat: pulihkan filter dari sessionStorage (state per
  // tab). Jika belum ada filter tersimpan pada sesi ini, gunakan preferensi
  // kota dari Cookie (persisten lintas sesi) sebagai nilai awal saja untuk
  // pengisian form — BUKAN untuk langsung ditulis ulang ke sessionStorage,
  // supaya sessionStorage tetap benar-benar kosong sampai pengguna sendiri
  // mengubah filter pada tab ini.
  useEffect(() => {
    const savedFilter = loadFilterSession();
    if (savedFilter) {
      setQ(savedFilter.q || "");
      setKota(savedFilter.kota || "");
      setTipe(savedFilter.tipe || "");
      setMaxHarga(savedFilter.maxHarga || "");
    } else {
      const kotaPref = getKotaPreferensi();
      if (kotaPref) {
        setKota(kotaPref);
        skipNextSessionSave.current = true;
      }
    }
    initialized.current = true;
  }, []);

  // useEffect: ambil data dari API route setiap kali filter berubah (debounce 300ms)
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("/api/kos", {
          params: { q, kota, tipe, maxHarga },
        });
        setKosList(res.data.data);
      } catch {
        setError("Gagal memuat data kos. Coba lagi nanti.");
      } finally {
        setLoading(false);
      }

      // Simpan filter aktif ke sessionStorage (hanya berlaku selama tab ini
      // terbuka) setelah inisialisasi awal selesai. Lewati SATU KALI tepat
      // setelah kota diisi otomatis dari Cookie (bukan aksi pengguna), agar
      // sessionStorage pada tab baru tetap kosong sampai pengguna benar-benar
      // mengubah filter — lihat Bab 4.5 (temuan debugging) pada laporan.
      if (initialized.current) {
        if (skipNextSessionSave.current) {
          skipNextSessionSave.current = false;
        } else {
          saveFilterSession({ q, kota, tipe, maxHarga });
        }
        if (kota) saveKotaPreferensi(kota);
      }
      refreshDebug();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, kota, tipe, maxHarga]);

  function refreshDebug() {
    if (typeof window === "undefined") return;
    setDebugData({
      ls: JSON.stringify({ [KEYS.LS_FAVORIT_KEY]: getFavorit() }, null, 2),
      ss: JSON.stringify({ [KEYS.SS_FILTER_KEY]: loadFilterSession() }, null, 2),
      cookie: document.cookie || "(kosong)",
    });
  }

  return (
    <>
      <h1 className="section-title">Cari kos</h1>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Cari nama kos atau alamat..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={kota} onChange={(e) => setKota(e.target.value)}>
          <option value="">Semua Kota</option>
          <option value="Yogyakarta">Yogyakarta</option>
          <option value="Bandung">Bandung</option>
          <option value="Jakarta">Jakarta</option>
          <option value="Semarang">Semarang</option>
        </select>
        <select value={tipe} onChange={(e) => setTipe(e.target.value)}>
          <option value="">Semua Tipe</option>
          <option value="Putra">Putra</option>
          <option value="Putri">Putri</option>
          <option value="Campur">Campur</option>
        </select>
        <select value={maxHarga} onChange={(e) => setMaxHarga(e.target.value)}>
          <option value="">Semua Harga</option>
          <option value="600000">≤ Rp 600.000</option>
          <option value="900000">≤ Rp 900.000</option>
          <option value="1200000">≤ Rp 1.200.000</option>
          <option value="1500000">≤ Rp 1.500.000</option>
        </select>
      </div>

      {loading && (
        <div className="status-info">
          <div className="spinner" />
          Memuat data kos...
        </div>
      )}

      {error && <div className="status-info">⚠️ {error}</div>}

      {!loading && !error && kosList.length === 0 && (
        <div className="status-info">
          😔 Tidak ada kos yang cocok dengan pencarianmu.
        </div>
      )}

      {!loading && !error && (
        <div className="kos-grid">
          {kosList.map((kos) => (
            <KosCard key={kos.id} kos={kos} />
          ))}
        </div>
      )}

      <section className="debug-panel" data-testid="debug-panel">
        <button
          type="button"
          className="debug-toggle"
          data-testid="debug-toggle"
          onClick={() => {
            refreshDebug();
            setDebugOpen((o) => !o);
          }}
        >
          {debugOpen ? "Sembunyikan" : "Tampilkan"} Panel Debug (Client-side Storage)
        </button>
        {debugOpen && (
          <div className="debug-grid">
            <div>
              <h3>localStorage</h3>
              <pre data-testid="debug-ls">{debugData.ls}</pre>
            </div>
            <div>
              <h3>sessionStorage</h3>
              <pre data-testid="debug-ss">{debugData.ss}</pre>
            </div>
            <div>
              <h3>Cookie</h3>
              <pre data-testid="debug-cookie">{debugData.cookie}</pre>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
