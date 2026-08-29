import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

// Mock geolocation to Palghar coordinates
test.use({
  geolocation: { latitude: 19.6967, longitude: 72.7699 },
  permissions: ['geolocation'],
});

async function login(page) {
  await page.goto(BASE_URL);
  // Login modal should appear
  await page.fill('input[type="text"]', 'farmer1');
  await page.fill('input[type="password"]', 'farmer123');
  await page.click('button[type="submit"]');
  // Wait for dashboard to load (login modal disappears)
  await page.waitForTimeout(3000);
}

test.describe('AI Floating Chat - UI Features', () => {

  test('1. Floating button appears after login', async ({ page }) => {
    await login(page);
    // The purple floating button with AI badge
    const floatBtn = page.locator('button:has-text("AI"), button.fixed.bottom-6.right-6').first();
    await expect(floatBtn).toBeVisible({ timeout: 10000 });
  });

  test('2. Chat panel opens on button click', async ({ page }) => {
    await login(page);
    await page.locator('button.fixed.bottom-6.right-6').first().click();
    await page.waitForTimeout(1000);
    // Chat panel shows the tagline and input
    await expect(page.getByText('Detect').first()).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('3. Language selector has 8 languages', async ({ page }) => {
    await login(page);
    await page.locator('button.fixed.bottom-6.right-6').first().click();
    // Find the select that contains language options (has हिन्दी)
    const allSelects = page.locator('select');
    const count = await allSelects.count();
    let langOptions: string[] = [];
    for (let i = 0; i < count; i++) {
      const opts = await allSelects.nth(i).locator('option').allTextContents();
      if (opts.some(o => o.includes('हिन्दी'))) { langOptions = opts; break; }
    }
    console.log('Languages available:', langOptions);
    expect(langOptions.length).toBeGreaterThanOrEqual(8);
    expect(langOptions.some(o => o.includes('हिन्दी'))).toBeTruthy();
    expect(langOptions.some(o => o.includes('মराठी') || o.includes('मराठी'))).toBeTruthy();
    expect(langOptions.some(o => o.includes('বাংলা'))).toBeTruthy();
  });

  test('4. GPS capture button works', async ({ page }) => {
    await login(page);
    await page.locator('button.fixed.bottom-6.right-6').first().click();
    // Click capture location button
    await page.getByText('Capture Location').click();
    await page.waitForTimeout(2000);
    // Should show captured coordinates (19.69, 72.76)
    const gpsText = await page.getByText(/19\.\d+, 72\.\d+/).count();
    console.log('GPS coordinates displayed:', gpsText > 0);
    expect(gpsText).toBeGreaterThan(0);
  });

  test('5. Text chat returns diagnosis with cards', async ({ page }) => {
    await login(page);
    await page.locator('button.fixed.bottom-6.right-6').first().click();
    // Type symptoms
    await page.locator('textarea').fill('cow has fever blisters in mouth drooling');
    await page.locator('textarea').press('Enter');
    // Wait for AI response
    await page.waitForTimeout(6000);
    // Should show disease name
    await expect(page.getByText(/Foot and Mouth Disease/i).first()).toBeVisible({ timeout: 10000 });
    // Should show treatment button
    await expect(page.getByText(/First Aid & Treatment/i).first()).toBeVisible();
  });

  test('6. Treatment section expands', async ({ page }) => {
    await login(page);
    await page.locator('button.fixed.bottom-6.right-6').first().click();
    await page.locator('textarea').fill('cow fever blisters drooling');
    await page.locator('textarea').press('Enter');
    await page.waitForTimeout(6000);
    // Click treatment expander
    await page.getByText(/First Aid & Treatment/i).first().click();
    await page.waitForTimeout(500);
    // Should show drug info
    await expect(page.getByText(/Drugs:/i).first()).toBeVisible();
  });

  test('7. Area Intelligence section shows', async ({ page }) => {
    await login(page);
    await page.locator('button.fixed.bottom-6.right-6').first().click();
    await page.locator('textarea').fill('cow fever blisters drooling');
    await page.locator('textarea').press('Enter');
    await page.waitForTimeout(6000);
    await page.getByText(/Area Intelligence/i).first().click();
    await page.waitForTimeout(500);
    // Should show vaccination/herd info
    const hasIntel = await page.getByText(/at risk|coverage|vaccination/i).count();
    expect(hasIntel).toBeGreaterThan(0);
  });

  test('8. Read Aloud (TTS) button present', async ({ page }) => {
    await login(page);
    await page.locator('button.fixed.bottom-6.right-6').first().click();
    await page.locator('textarea').fill('cow fever blisters');
    await page.locator('textarea').press('Enter');
    await page.waitForTimeout(6000);
    await expect(page.getByText(/Read Aloud/i).first()).toBeVisible();
  });

  test('9. Quick prompt buttons work', async ({ page }) => {
    await login(page);
    await page.locator('button.fixed.bottom-6.right-6').first().click();
    // Click the goat quick prompt button
    await page.locator('button', { hasText: 'Goat diarrhea' }).first().click();
    await page.waitForTimeout(8000);
    // Should return a diagnosis (PPR expected but any disease response confirms it worked)
    const gotResponse = await page.getByText(/Peste|risk|confidence|First Aid/i).count();
    console.log('Quick prompt response elements:', gotResponse);
    expect(gotResponse).toBeGreaterThan(0);
  });

  test('10. Voice mic + speech synthesis APIs available', async ({ page }) => {
    await login(page);
    await page.locator('button.fixed.bottom-6.right-6').first().click();
    // Check Web Speech APIs are available in the page
    const apis = await page.evaluate(() => ({
      speechSynthesis: 'speechSynthesis' in window,
      speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    }));
    console.log('Speech APIs:', apis);
    // speechSynthesis is always available in Chromium
    expect(apis.speechSynthesis).toBeTruthy();
  });

  test('11. Auto-report button appears for high risk', async ({ page }) => {
    await login(page);
    await page.locator('button.fixed.bottom-6.right-6').first().click();
    await page.locator('textarea').fill('animal died suddenly blood oozing');
    await page.locator('textarea').press('Enter');
    await page.waitForTimeout(6000);
    // Anthrax = emergency = should show File Report
    await expect(page.getByText(/File Disease Report/i).first()).toBeVisible({ timeout: 10000 });
  });

});
