import Link from "next/link";
import { notFound } from "next/navigation";
import { getKosById, kosList } from "@/lib/data";
import { formatRupiah } from "@/components/KosCard";
import FavoritButton from "@/components/FavoritButton";

// SSG: pra-render semua halaman detail saat build
export function generateStaticParams() {
  return kosList.map((kos) => ({ id: String(kos.id) }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const kos = getKosById(id);
  return { title: kos ? `${kos.nama} — KosKita` : "Kos tidak ditemukan" };
}

export default async function DetailKosPage({ params }) {
  const { id } = await params;
  const kos = getKosById(id);

  if (!kos) notFound();

  return (
    <>
      <Link href="/kos" className="back-link">
        ← Kembali ke pencarian
      </Link>

      <div className="detail-header" style={{ background: kos.warna }}>
        <span className="stencil">TERIMA KOS {kos.tipe.toUpperCase()}</span>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <div className="detail-title-row">
            <h1>{kos.nama}</h1>
            <FavoritButton id={kos.id} className="favorit-btn-detail" />
          </div>
          <p className="lokasi">{kos.alamat}, {kos.kota}</p>
          <span className="rating">★ {kos.rating} / 5.0</span>

          <p className="deskripsi">{kos.deskripsi}</p>

          <h3 style={{ marginTop: 20 }}>Fasilitas</h3>
          <ul className="fasilitas-list">
            {kos.fasilitas.map((f) => (
              <li key={f}>✔ {f}</li>
            ))}
          </ul>
        </div>

        <div className="sidebar-card">
          <div className="harga-besar">{formatRupiah(kos.harga)}</div>
          <div className="per-bulan">per bulan</div>
          <div style={{ marginTop: 16 }}>
            <div className="info-baris">
              <span>Tipe kos</span>
              <strong>{kos.tipe}</strong>
            </div>
            <div className="info-baris">
              <span>Kamar tersedia</span>
              <strong>{kos.kamarTersedia} kamar</strong>
            </div>
            <div className="info-baris">
              <span>Kota</span>
              <strong>{kos.kota}</strong>
            </div>
          </div>
          <button className="btn btn-primary">Hubungi Pemilik</button>
        </div>
      </div>
    </>
  );
}
