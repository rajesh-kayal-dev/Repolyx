const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', exception => logs.push(`[pageerror] ${exception}`));

  console.log('Navigating to http://localhost:3000/debug...');
  
  try {
    await page.goto('http://localhost:3000/debug', { waitUntil: 'networkidle' });
    
    // Wait for a second to ensure data loads
    await page.waitForTimeout(2000);
    
    console.log('--- CONSOLE LOGS ---');
    if (logs.length === 0) {
      console.log('No console logs recorded.');
    } else {
      logs.forEach(l => console.log(l));
    }
    console.log('--------------------');
  } catch (err) {
    console.error('Error during navigation:', err);
  } finally {
    await browser.close();
  }
})();
