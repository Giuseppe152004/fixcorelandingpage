const puppeteer = require('puppeteer-core');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: "new"
  });

  const page = await browser.newPage();
  
  console.log('Capturing desktop...');
  // Desktop
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:8000/wireframe.html', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'wireframe_desktop_full.png', fullPage: true });

  console.log('Capturing mobile...');
  // Mobile
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:8000/wireframe.html', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'wireframe_mobile_full.png', fullPage: true });

  await browser.close();
  console.log('Done.');
})();
