import Link from "next/link";
import FavoritButton from "./FavoritButton";

export function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

// Komponen presentasional: menerima data lewat props
export default function KosCard({ kos }) {
  return (
    <Link href={`/kos/${kos.id}`} className="kos-card">
      <div className="thumb" style={{ background: kos.warna }}>
        <span className="stencil">TERIMA KOS {kos.tipe.toUpperCase()}</span>
        <FavoritButton id={kos.id} className="favorit-btn-card" />
      </div>
      <div className="body">
        <h3>{kos.nama}</h3>
        <p className="lokasi">{kos.kota} — {kos.alamat}</p>
        <span className="rating">★ {kos.rating}</span>
        <p className="harga">{formatRupiah(kos.harga)}/bln</p>
      </div>
    </Link>
  );
}
