"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="brand">
          KosKita
        </Link>
        <nav>
          <Link href="/" className={pathname === "/" ? "active" : ""}>
            Beranda
          </Link>
          <Link href="/kos" className={pathname.startsWith("/kos") ? "active" : ""}>
            Cari Kos
          </Link>
          <Link href="/favorit" className={pathname === "/favorit" ? "active" : ""}>
            Favorit
          </Link>
          <Link href="/tentang" className={pathname === "/tentang" ? "active" : ""}>
            Tentang
          </Link>
        </nav>
      </div>
    </header>
  );
}
