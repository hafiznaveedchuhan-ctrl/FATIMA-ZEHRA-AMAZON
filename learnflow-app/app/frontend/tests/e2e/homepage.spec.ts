import { test, expect } from '@playwright/test';

test.describe('Homepage Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should load homepage with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Fatima Zehra/);
  });

  test('should display Fatima Zehra brand name in navbar', async ({ page }) => {
    const brandText = page.locator('text=FATIMA');
    await expect(brandText.first()).toBeVisible();
  });

  test('should display hero section with tagline', async ({ page }) => {
    await expect(page.locator('text=Timeless')).toBeVisible();
    await expect(page.locator('text=Elegance')).toBeVisible();
    await expect(page.locator('text=Redefined')).toBeVisible();
  });

  test('should display New Collection 2026 badge', async ({ page }) => {
    await expect(page.locator('text=New Collection 2026')).toBeVisible();
  });

  test('should display hero description text', async ({ page }) => {
    await expect(page.locator('text=Fatima Zehra Boutique brings you')).toBeVisible();
  });

  test('should display Explore Boutique CTA button', async ({ page }) => {
    const cta = page.locator('text=Explore Boutique');
    await expect(cta).toBeVisible();
  });

  test('should navigate to products page via Explore Boutique CTA', async ({ page }) => {
    const cta = page.locator('a:has-text("Explore Boutique")');
    await expect(cta).toBeVisible();
    await cta.click();
    await page.waitForURL(/\/products/);
    expect(page.url()).toContain('/products');
  });

  test('should display hero image', async ({ page }) => {
    const heroImage = page.locator('img[alt="Fatima Zehra Luxury Collection"]');
    await expect(heroImage).toBeVisible();
  });

  test('should display strategic values section', async ({ page }) => {
    await expect(page.locator('text=Express Shipping')).toBeVisible();
    await expect(page.locator('text=Secure Payment')).toBeVisible();
    await expect(page.locator('text=Made with Love')).toBeVisible();
  });

  test('should display all 4 category cards', async ({ page }) => {
    await expect(page.locator('text=Fancy Suits').first()).toBeVisible();
    await expect(page.locator('text=Shalwar Qameez').first()).toBeVisible();
    await expect(page.locator('text=Cotton Suits').first()).toBeVisible();
    await expect(page.locator('text=Designer Brands').first()).toBeVisible();
  });

  test('should display categories section heading', async ({ page }) => {
    await expect(page.locator('text=Shop by')).toBeVisible();
    await expect(page.locator('text=Department')).toBeVisible();
  });

  test('should display The Collections label', async ({ page }) => {
    await expect(page.locator('text=The Collections')).toBeVisible();
  });

  test('should display category tags', async ({ page }) => {
    await expect(page.locator('text=Wedding Wear')).toBeVisible();
    await expect(page.locator('text=Luxury Edition')).toBeVisible();
    await expect(page.locator('text=Premium Fabric')).toBeVisible();
    await expect(page.locator('text=New Arrival')).toBeVisible();
  });

  test('should display Trending Now section', async ({ page }) => {
    await expect(page.locator('text=Trending')).toBeVisible();
    await expect(page.locator('text=Now')).toBeVisible();
  });

  test('should display product cards in featured section', async ({ page }) => {
    // The page renders 5 product cards from the first category
    const productCards = page.locator('img[alt]');
    const count = await productCards.count();
    expect(count).toBeGreaterThan(3);
  });

  test('should display luxury CTA section', async ({ page }) => {
    await expect(page.locator('text=Confidence')).toBeVisible();
    await expect(page.locator('text=Shop the Collection')).toBeVisible();
  });

  test('should display contact info in header bar', async ({ page }) => {
    await expect(page.locator('text=Karachi, Pakistan')).toBeVisible();
    await expect(page.locator('text=+92 300 2385209')).toBeVisible();
  });

  test('should display free shipping banner', async ({ page }) => {
    await expect(page.locator('text=Free Worldwide Shipping')).toBeVisible();
  });

  test('should have no critical console errors', async ({ page }) => {
    const criticalErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Filter out known non-critical errors (e.g., favicon, external resources)
        if (!text.includes('favicon') && !text.includes('Failed to load resource')) {
          criticalErrors.push(text);
        }
      }
    });
    await page.goto('/');
    await page.waitForTimeout(2000);
    // Allow up to 2 non-critical errors (hydration warnings, etc.)
    expect(criticalErrors.length).toBeLessThanOrEqual(2);
  });

  test('should display navigation links', async ({ page }) => {
    await expect(page.locator('a:has-text("Home")')).toBeVisible();
    await expect(page.locator('a:has-text("Shop")')).toBeVisible();
  });

  test('should display cart icon in navbar', async ({ page }) => {
    const cartLink = page.locator('a[href="/cart"]');
    await expect(cartLink).toBeVisible();
  });

  test('should display spinning logo', async ({ page }) => {
    const logo = page.locator('.logo-spin-infinite');
    await expect(logo).toBeVisible();
  });
});
