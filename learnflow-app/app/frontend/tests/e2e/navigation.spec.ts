import { test, expect } from '@playwright/test';

test.describe('Navigation Tests - Desktop', () => {
  test('should display navbar with all navigation links', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('a:has-text("Home")')).toBeVisible();
    await expect(page.locator('a:has-text("Shop")')).toBeVisible();
    await expect(page.locator('a:has-text("About")')).toBeVisible();
    await expect(page.locator('a:has-text("Contact")')).toBeVisible();
  });

  test('should display cart link with badge', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const cartLink = page.locator('a[href="/cart"]');
    await expect(cartLink).toBeVisible();
  });

  test('should navigate to products page via Shop link', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.click('a:has-text("Shop")');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/products');
    await expect(page.locator('text=Our Collection')).toBeVisible();
  });

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.click('a:has-text("About")');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/about');
  });

  test('should navigate to contact page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.click('a:has-text("Contact")');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/contact');
  });

  test('should navigate to cart page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.click('a[href="/cart"]');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/cart');
  });

  test('should navigate home via logo click', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');
    await page.click('a[href="/"]');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toMatch(/\/$/);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1:has-text("Login")')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/auth/register');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1:has-text("Register")')).toBeVisible();
  });

  test('should navigate from login to register via link', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('domcontentloaded');
    await page.click('a:has-text("Register")');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/auth/register');
  });

  test('should navigate from register to login via link', async ({ page }) => {
    await page.goto('/auth/register');
    await page.waitForLoadState('domcontentloaded');
    await page.click('a:has-text("Login")');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/auth/login');
  });

  test('should load all main pages with 200 status', async ({ page }) => {
    const pages = ['/', '/products', '/cart', '/about', '/contact', '/auth/login', '/auth/register', '/privacy', '/terms'];
    for (const path of pages) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
    }
  });

  test('should load all 40 product detail pages', async ({ page }) => {
    for (let id = 1; id <= 40; id++) {
      const response = await page.goto(`/products/${id}`);
      expect(response?.status()).toBe(200);
    }
  });

  test('should navigate category links from homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const categoryLink = page.locator('a[href*="/products?category="]').first();
    await categoryLink.click();
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/products');
  });
});

test.describe('Mobile Navigation Tests', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should show mobile menu toggle button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // The mobile menu button uses lg:hidden class
    const menuButton = page.locator('button.lg\\:hidden');
    await expect(menuButton).toBeVisible();
  });

  test('should open mobile menu and show navigation links', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const menuButton = page.locator('button.lg\\:hidden');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(500);
      // Mobile menu should show Home and Shop links
      await expect(page.locator('text=Home')).toBeVisible();
      await expect(page.locator('text=Shop')).toBeVisible();
    }
  });

  test('should display cart icon on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const cartLink = page.locator('a[href="/cart"]');
    await expect(cartLink).toBeVisible();
  });

  test('should render homepage content on mobile viewport', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Timeless')).toBeVisible();
    await expect(page.locator('text=Explore Boutique')).toBeVisible();
  });

  test('should render products page on mobile viewport', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Our Collection')).toBeVisible();
  });
});
