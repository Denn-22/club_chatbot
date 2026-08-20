const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3556';
const SHOT_DIR = path.resolve(__dirname, 'screenshots');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const results = [];
function log(id, desc, pass, detail) {
  results.push({ id, desc, pass, detail });
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${id} — ${desc}`);
  if (detail) console.log('    ' + detail);
}

async function openDebugPanel(page) {
  const toggle = page.locator('[data-testid="debug-toggle"]');
  const isOpen = await page.locator('[data-testid="debug-ls"]').count();
  if (!isOpen) await toggle.click();
  await page.waitForTimeout(400);
}

(async () => {
  const browser = await chromium.launch();

  // ============================================================
  // GROUP F — FUNCTIONAL TESTING
  // ============================================================
  let context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  let page = await context.newPage();
  await page.goto(`${BASE_URL}/kos`, { waitUntil: 'networkidle' });

  // F-01: Filter berdasarkan kota
  await page.selectOption('.filter-bar select >> nth=0', 'Yogyakarta');
  await page.waitForTimeout(1200);
  let cardTexts = await page.$$eval('.kos-card .lokasi', els => els.map(e => e.textContent));
  let allYogya = cardTexts.every(t => t.includes('Yogyakarta'));
  log('F-01', 'Filter kota "Yogyakarta" menampilkan hanya kos di kota tsb', allYogya && cardTexts.length > 0,
    `Lokasi hasil: ${JSON.stringify(cardTexts)}`);

  // F-02: Pencarian berdasarkan kata kunci
  await page.fill('.filter-bar input[type=text]', 'Melati');
  await page.waitForTimeout(1200);
  let namaHasil = await page.$$eval('.kos-card h3', els => els.map(e => e.textContent));
  log('F-02', 'Pencarian kata kunci "Melati" menampilkan kos yang sesuai', namaHasil.length === 1 && namaHasil[0].includes('Melati'),
    `Hasil pencarian: ${JSON.stringify(namaHasil)}`);

  // Reset pencarian agar kartu "Kos Melati Residence" konsisten muncul untuk tes berikut
  await page.fill('.filter-bar input[type=text]', '');
  await page.selectOption('.filter-bar select >> nth=0', '');
  await page.waitForTimeout(1200);

  // F-03: Toggle favorit pada kartu kos
  const melatiCard = page.locator('.kos-card', { hasText: 'Kos Melati Residence' });
  await melatiCard.locator('[data-testid="favorit-btn"]').click();
  await page.waitForTimeout(400);
  let lsFavorit = await page.evaluate(() => localStorage.getItem('koskita_favorit'));
  log('F-03', 'Menandai kos sebagai favorit tersimpan ke localStorage', JSON.parse(lsFavorit || '[]').includes(1),
    `localStorage.koskita_favorit = ${lsFavorit}`);

  await page.screenshot({ path: path.join(SHOT_DIR, '01-kos-favorit-added.png') });

  // F-04: Halaman /favorit menampilkan kos yang difavoritkan
  await page.goto(`${BASE_URL}/favorit`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(200);
  let favoritNama = await page.$$eval('.kos-card h3', els => els.map(e => e.textContent));
  log('F-04', 'Halaman Favorit menampilkan kos yang telah ditandai', favoritNama.includes('Kos Melati Residence'),
    `Isi halaman Favorit: ${JSON.stringify(favoritNama)}`);
  await page.screenshot({ path: path.join(SHOT_DIR, '02-halaman-favorit.png') });

  // F-05: Toggle favorit dari halaman detail, konsisten dengan status sebelumnya
  await page.goto(`${BASE_URL}/kos/1`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400); // beri waktu useEffect membaca localStorage setelah mount
  let detailFavState = await page.locator('[data-testid="favorit-btn"]').innerText();
  log('F-05', 'Status tombol favorit di halaman detail konsisten dengan localStorage (♥ = sudah favorit)',
    detailFavState.trim() === '♥', `Isi tombol favorit di halaman detail = "${detailFavState.trim()}"`);

  // F-06: Hapus favorit (toggle lagi) dari halaman detail
  await page.locator('[data-testid="favorit-btn"]').click();
  await page.waitForTimeout(400);
  let lsFavoritAfterRemove = await page.evaluate(() => localStorage.getItem('koskita_favorit'));
  await page.goto(`${BASE_URL}/favorit`, { waitUntil: 'networkidle' });
  let emptyState = await page.locator('[data-testid="favorit-empty"]').count();
  log('F-06', 'Menghapus favorit memperbarui localStorage & menghilang dari halaman Favorit',
    !JSON.parse(lsFavoritAfterRemove || '[]').includes(1) && emptyState === 1,
    `localStorage setelah dihapus = ${lsFavoritAfterRemove}, halaman Favorit kosong = ${emptyState === 1}`);

  // ============================================================
  // GROUP S — STATE CONSISTENCY (sessionStorage filter, cookie kota, localStorage favorit)
  // ============================================================
  await page.goto(`${BASE_URL}/kos`, { waitUntil: 'networkidle' });
  await page.selectOption('.filter-bar select >> nth=0', 'Bandung');   // kota
  await page.selectOption('.filter-bar select >> nth=1', 'Putri');     // tipe
  await page.waitForTimeout(1200);

  let ssFilter = await page.evaluate(() => sessionStorage.getItem('koskita_filter'));
  let cookieKota = await page.evaluate(() => document.cookie);
  log('S-01', 'Filter (kota=Bandung, tipe=Putri) tersimpan ke sessionStorage setelah diubah',
    JSON.parse(ssFilter).kota === 'Bandung' && JSON.parse(ssFilter).tipe === 'Putri',
    `sessionStorage.koskita_filter = ${ssFilter}`);
  log('S-02', 'Preferensi kota tersimpan sebagai Cookie saat filter kota diubah',
    cookieKota.includes('koskita_kota_preferensi=Bandung'),
    `document.cookie = "${cookieKota}"`);

  await openDebugPanel(page);
  await page.screenshot({ path: path.join(SHOT_DIR, '03-debug-panel-filter.png') });

  // S-03: Reload halaman -> filter dipulihkan dari sessionStorage
  await page.reload({ waitUntil: 'networkidle' });
  let kotaValAfterReload = await page.locator('.filter-bar select >> nth=0').inputValue();
  let tipeValAfterReload = await page.locator('.filter-bar select >> nth=1').inputValue();
  log('S-03', 'Setelah reload, filter kota & tipe tetap terisi (dipulihkan dari sessionStorage)',
    kotaValAfterReload === 'Bandung' && tipeValAfterReload === 'Putri',
    `Nilai select setelah reload: kota="${kotaValAfterReload}", tipe="${tipeValAfterReload}"`);

  // S-04: Tutup tab, buka TAB BARU pada context/browser yang sama
  await page.close();
  page = await context.newPage();
  await page.goto(`${BASE_URL}/kos`, { waitUntil: 'networkidle' });
  let ssFilterNewTab = await page.evaluate(() => sessionStorage.getItem('koskita_filter'));
  let kotaValNewTab = await page.locator('.filter-bar select >> nth=0').inputValue();
  let tipeValNewTab = await page.locator('.filter-bar select >> nth=1').inputValue();
  log('S-04', 'sessionStorage direset pada tab baru (kosong), namun kota otomatis terisi kembali dari Cookie (fallback)',
    ssFilterNewTab === null && kotaValNewTab === 'Bandung' && tipeValNewTab === '',
    `sessionStorage pada tab baru = ${ssFilterNewTab}; kota (dari cookie) = "${kotaValNewTab}"; tipe = "${tipeValNewTab}" (tidak ikut cookie, hanya kota yang di-cookie-kan)`);

  let lsFavoritNewTab = await page.evaluate(() => localStorage.getItem('koskita_favorit'));
  log('S-05', 'localStorage favorit tetap ada pada tab baru (persisten per origin, bukan per tab)',
    lsFavoritNewTab !== null, `localStorage.koskita_favorit pada tab baru = ${lsFavoritNewTab}`);

  // S-06: Profil/browser baru sepenuhnya -> semua storage kosong
  const newProfileContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const newProfilePage = await newProfileContext.newPage();
  await newProfilePage.goto(`${BASE_URL}/kos`, { waitUntil: 'networkidle' });
  let lsNewProfile = await newProfilePage.evaluate(() => localStorage.getItem('koskita_favorit'));
  let cookiesNewProfile = await newProfileContext.cookies();
  let kotaSelectNewProfile = await newProfilePage.locator('.filter-bar select >> nth=0').inputValue();
  log('S-06', 'Pada profil/browser baru, localStorage & cookie kosong sehingga filter kota kembali ke default',
    !lsNewProfile && cookiesNewProfile.length === 0 && kotaSelectNewProfile === '',
    `localStorage = ${lsNewProfile}, jumlah cookie = ${cookiesNewProfile.length}, kota default = "${kotaSelectNewProfile}"`);
  await newProfileContext.close();

  // ============================================================
  // GROUP SEC — SECURITY: XSS pada input pencarian
  // ============================================================
  let dialogFired = false;
  page.on('dialog', async d => { dialogFired = true; await d.dismiss(); });
  await page.fill('.filter-bar input[type=text]', '<script>alert("XSS")</script>');
  await page.waitForTimeout(1200);
  let searchBoxValue = await page.locator('.filter-bar input[type=text]').inputValue();
  let statusInfoHTML = await page.locator('.status-info').first().innerHTML().catch(() => '');
  log('SEC-01', 'Payload <script> pada kolom pencarian tidak dieksekusi (React auto-escape)',
    !dialogFired, `dialog alert muncul = ${dialogFired}; nilai input = "${searchBoxValue}"`);
  await page.screenshot({ path: path.join(SHOT_DIR, '04-xss-search-test.png') });

  // ============================================================
  // GROUP NF — NON-FUNCTIONAL: RESPONSIVENESS
  // ============================================================
  await page.fill('.filter-bar input[type=text]', '');
  await page.waitForTimeout(400);
  const viewports = [
    { name: 'mobile', width: 375, height: 800 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 },
  ];
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(SHOT_DIR, `05-responsive-${vp.name}.png`) });
    let overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    log(`NF-RWD-${vp.name}`, `Tidak ada horizontal overflow pada breakpoint ${vp.name} (${vp.width}px)`, !overflow,
      `scrollWidth > innerWidth = ${overflow}`);
  }

  // ============================================================
  // GROUP NF — NON-FUNCTIONAL: PERFORMANCE
  // ============================================================
  const perfContext = await browser.newContext();
  const perfPage = await perfContext.newPage();
  const t0 = Date.now();
  await perfPage.goto(`${BASE_URL}/kos`, { waitUntil: 'load' });
  const loadTime = Date.now() - t0;
  const perfTiming = await perfPage.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    return { domContentLoaded: Math.round(nav.domContentLoadedEventEnd), loadEvent: Math.round(nav.loadEventEnd) };
  });
  log('NF-PERF-01', 'Waktu muat halaman /kos tergolong wajar pada mode development (<3000ms)',
    loadTime < 3000, `Total waktu goto()->load = ${loadTime}ms (mode next dev, belum production build); timing = ${JSON.stringify(perfTiming)}`);
  await perfContext.close();

  await context.close();
  await browser.close();

  const passCount = results.filter(r => r.pass).length;
  console.log('\n================ RINGKASAN ================');
  console.log(`Total skenario: ${results.length} | PASS: ${passCount} | FAIL: ${results.length - passCount}`);
  fs.writeFileSync(path.join(__dirname, 'test-results.json'), JSON.stringify(results, null, 2));
})();
