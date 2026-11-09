const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type()==='error' && errs.push(m.text()));
  const S = n => p.screenshot({ path: `/home/claude/smg/build/${n}.png` });
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1200);
  await S('01-journey'); await p.check('.jy-open input'); await p.waitForTimeout(300);
  await p.click('.jy-node >> nth=1'); await p.waitForTimeout(400); await S('02-card');
  await p.click('.jy-go'); await p.waitForTimeout(500); await S('03-quiz');
  for (let k = 0; k < 9; k++) {
    if (await p.isVisible('.gs-result')) break;
    await p.click('.qz-opt >> nth=0'); await p.waitForTimeout(900); if (await p.isVisible('.gs-result')) break;
    if (await p.isVisible('.qz-next')) await p.click('.qz-next'); else await p.waitForTimeout(1000);
  }
  await p.waitForTimeout(800); await S('04-result');
  await p.click('text=🗺 यात्रा · Map'); await p.waitForTimeout(300);
  // builder b9
  await p.click('.jy-node >> nth=8'); await p.click('.jy-go'); await p.waitForTimeout(500);
  await p.click('.sb-tray .sb-tile >> nth=0'); await p.waitForTimeout(200); await S('05-build');
  await p.click('.gs-back');
  // memory b1
  await p.click('.jy-node >> nth=0'); await p.click('.jy-go'); await p.waitForTimeout(800); await S('06-memory');
  await p.click('.gs-back');
  // verb quiz b7 + flag
  await p.click('.jy-node >> nth=6'); await p.click('.jy-go'); await p.waitForTimeout(500); await S('07-verbquiz');
  await p.click('.fl-wide'); await p.waitForTimeout(200); await p.fill('.fl-box input', 'भवन्ति'); await S('08-flagdlg');
  await p.click('.fl-btns .gs-primary'); await p.waitForTimeout(300);
  await p.click('.gs-back');
  // books
  await p.click('.view-btn >> nth=1'); await p.waitForTimeout(500); await S('09-words');
  await p.click('.view-btn >> nth=2'); await p.waitForTimeout(500); await p.click('.ks-list button >> nth=1'); await p.waitForTimeout(300); await S('10-verbs');
  await p.click('.view-btn >> nth=3'); await p.waitForTimeout(500); await S('11-sents');
  await p.click('.app-footer button'); await p.waitForTimeout(400); await S('12-flags');
  // a few stations quickly for runtime errors
  await p.click('.view-btn >> nth=0'); await p.waitForTimeout(300);
  const n = await p.locator('.jy-node').count();
  for (let i = 0; i < n; i++) { await p.click(`.jy-node >> nth=${i}`); await p.click('.jy-go'); await p.waitForTimeout(350);
    const t = await p.textContent('.gs-stage'); if (/No questions|No sentences/.test(t)) errs.push('empty station '+i); await p.click('.gs-back'); await p.waitForTimeout(150); }
  await p.setViewportSize({ width: 390, height: 844 }); await p.click('.jy-node >> nth=4'); await p.click('.jy-go'); await p.waitForTimeout(400); await S('13-phone');
  console.log('stations', n, 'errors', errs);
  await b.close();
})();
