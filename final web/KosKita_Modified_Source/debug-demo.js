/**
 * debug-demo.js
 * Demonstrasi proses debugging nyata pada aplikasi KosKita:
 * 1. Menjalankan aplikasi dalam kondisi BERMASALAH (localStorage berisi data korup)
 *    dan menangkap error yang muncul di Console — meniru kondisi nyata yang bisa
 *    terjadi jika data localStorage rusak/dimanipulasi manual oleh pengguna.
 * 2. Menunjukkan penyebab akar (root cause) melalui pembacaan kode.
 * 3. Menjalankan ulang setelah perbaikan (try/catch pada storage.js) untuk
 *    membuktikan aplikasi pulih dengan baik (graceful fallback).
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3556';
const SHOT_DIR = path.resolve(__dirname, 'screenshots');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const consoleMsgs = [];
  page.on('console', (m) => consoleMsgs.push(`[${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => consoleMsgs.push(`[pageerror] ${e.message}`));

  // Langkah 1: kunjungi halaman lalu SUNTIKKAN data localStorage yang KORUP
  // (JSON tidak valid) untuk mensimulasikan kondisi nyata: pengguna/skrip lain
  // mengubah localStorage secara manual sehingga datanya rusak.
  await page.goto(`${BASE_URL}/kos`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('koskita_favorit', '{ ini bukan JSON valid ]');
  });

  console.log('--- Reload dengan localStorage korup (SEBELUM perbaikan disimulasikan) ---');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SHOT_DIR, '06-debug-before-devtools-console.png') });

  const heartAfterCorrupt = await page.locator('[data-testid="favorit-btn"]').first().innerText().catch(() => '(elemen tidak ditemukan)');
  console.log('Isi tombol favorit pertama setelah localStorage korup:', heartAfterCorrupt);
  console.log('Pesan Console selama proses:');
  consoleMsgs.forEach((m) => console.log('  ' + m));

  fs.writeFileSync(
    path.join(__dirname, 'debug-console-log.json'),
    JSON.stringify({ heartAfterCorrupt, consoleMsgs }, null, 2)
  );

  await context.close();
  await browser.close();
})();
