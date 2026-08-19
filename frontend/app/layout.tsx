import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Almanak Klub — Dataset Explorer + AI',
  description:
    'Dataset klub sepak bola divisi 1 & 2 — MongoDB, NestJS, Next.js, MinIO, AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
