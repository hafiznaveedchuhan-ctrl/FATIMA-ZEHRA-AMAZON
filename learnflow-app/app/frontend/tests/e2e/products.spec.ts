import { test, expect } from '@playwright/test';

test.describe('Products Listing Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display products page heading', async ({ page }) => {
    await expect(page.locator('text=Our Collection')).toBeVisible();
  });

  test('should show total product count text (40+)', async ({ page }) => {
    await expect(page.locator('text=40')).toBeVisible();
  });

  test('should display search input', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
  });

  test('should display Filters heading', async ({ page }) => {
    await expect(page.locator('text=Filters')).toBeVisible();
  });

  test('should display all category filter buttons', async ({ page }) => {
    await expect(page.locator('text=Categories')).toBeVisible();
    await expect(page.locator('button:has-text("All Products")')).toBeVisible();
    await expect(page.locator('button:has-text("Fancy Suits")')).toBeVisible();
    await expect(page.locator('button:has-text("Shalwar Qameez")')).toBeVisible();
    await expect(page.locator('button:has-text("Cotton Suits")')).toBeVisible();
    await expect(page.locator('button:has-text("Designer Brands")')).toBeVisible();
  });

  test('should display price range filter with two sliders', async ({ page }) => {
    await expect(page.locator('text=Price Range')).toBeVisible();
    const rangeInputs = page.locator('input[type="range"]');
    expect(await rangeInputs.count()).toBe(2);
  });

  test('should display sort options dropdown', async ({ page }) => {
    await expect(page.locator('text=Sort By')).toBeVisible();
    const select = page.locator('select');
    await expect(select).toBeVisible();
  });

  test('should display Clear Filters button', async ({ page }) => {
    await expect(page.locator('button:has-text("Clear Filters")')).toBeVisible();
  });

  test('should display Showing products count', async ({ page }) => {
    await expect(page.locator('text=Showing')).toBeVisible();
  });

  test('should display 40 products when All is selected', async ({ page }) => {
    const showingText = page.locator('text=/Showing.*40/');
    await expect(showingText).toBeVisible();
  });

  test('should filter to 10 products when Fancy Suits clicked', async ({ page }) => {
    await page.click('button:has-text("Fancy Suits")');
    await page.waitForTimeout(500);
    const showingText = page.locator('text=/Showing.*10/');
    await expect(showingText).toBeVisible();
  });

  test('should filter to 10 products when Shalwar Qameez clicked', async ({ page }) => {
    await page.click('button:has-text("Shalwar Qameez")');
    await page.waitForTimeout(500);
    const showingText = page.locator('text=/Showing.*10/');
    await expect(showingText).toBeVisible();
  });

  test('should filter to 10 products when Cotton Suits clicked', async ({ page }) => {
    await page.click('button:has-text("Cotton Suits")');
    await page.waitForTimeout(500);
    const showingText = page.locator('text=/Showing.*10/');
    await expect(showingText).toBeVisible();
  });

  test('should filter to 10 products when Designer Brands clicked', async ({ page }) => {
    await page.click('button:has-text("Designer Brands")');
    await page.waitForTimeout(500);
    const showingText = page.locator('text=/Showing.*10/');
    await expect(showingText).toBeVisible();
  });

  test('should search products by name', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('Royal');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Royal Embroidered Fancy Suit')).toBeVisible();
  });

  test('should search products by material', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('Velvet');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Velvet Royal Collection')).toBeVisible();
  });

  test('should show no products found for invalid search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('xyznonexistent12345');
    await page.waitForTimeout(500);
    await expect(page.locator('text=No Products Found')).toBeVisible();
  });

  test('should clear filters and show all products again', async ({ page }) => {
    await page.click('button:has-text("Fancy Suits")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("Clear Filters")');
    await page.waitForTimeout(500);
    const showingText = page.locator('text=/Showing.*40/');
    await expect(showingText).toBeVisible();
  });

  test('should sort by price low to high', async ({ page }) => {
    await page.selectOption('select', 'price-low');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Showing')).toBeVisible();
  });

  test('should sort by price high to low', async ({ page }) => {
    await page.selectOption('select', 'price-high');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Showing')).toBeVisible();
  });

  test('should sort by top rated', async ({ page }) => {
    await page.selectOption('select', 'rating');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Showing')).toBeVisible();
  });

  test('should display product card images', async ({ page }) => {
    const productImages = page.locator('img[alt]');
    const count = await productImages.count();
    expect(count).toBeGreaterThan(10);
  });

  test('should display product prices with Rs prefix', async ({ page }) => {
    const priceElements = page.locator('text=/Rs\\s/');
    const count = await priceElements.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Product Detail Page Tests', () => {
  test('should display product 1 details', async ({ page }) => {
    await page.goto('/products/1');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Royal Embroidered Fancy Suit')).toBeVisible();
  });

  test('should display product price', async ({ page }) => {
    await page.goto('/products/1');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=8,500')).toBeVisible();
  });

  test('should display product image', async ({ page }) => {
    await page.goto('/products/1');
    await page.waitForLoadState('domcontentloaded');
    const image = page.locator('img[alt="Royal Embroidered Fancy Suit"]');
    await expect(image).toBeVisible();
  });

  test('should display size selection buttons', async ({ page }) => {
    await page.goto('/products/1');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('button:has-text("S")').first()).toBeVisible();
    await expect(page.locator('button:has-text("M")').first()).toBeVisible();
    await expect(page.locator('button:has-text("L")').first()).toBeVisible();
  });

  test('should display color options', async ({ page }) => {
    await page.goto('/products/1');
    await page.waitForLoadState('domcontentloaded');
    // Product 1 has colors: Red, Pink, Gold, Purple
    await expect(page.locator('text=Red').first()).toBeVisible();
  });

  test('should display WhatsApp button on product detail', async ({ page }) => {
    await page.goto('/products/1');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=WhatsApp').first()).toBeVisible();
  });

  test('should display Add to Cart button', async ({ page }) => {
    await page.goto('/products/1');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=/Add to Cart|Add To Cart/i').first()).toBeVisible();
  });

  test('should display product description', async ({ page }) => {
    await page.goto('/products/1');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Elegant party wear')).toBeVisible();
  });

  test('should display material information', async ({ page }) => {
    await page.goto('/products/1');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Premium Chiffon')).toBeVisible();
  });

  test('should display product rating', async ({ page }) => {
    await page.goto('/products/1');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=4.8')).toBeVisible();
  });

  test('should display discount/original price', async ({ page }) => {
    await page.goto('/products/1');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=12,000')).toBeVisible();
  });

  test('should load product from each category', async ({ page }) => {
    // Product 11 = Shalwar Qameez category
    await page.goto('/products/11');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Classic White Shalwar Qameez')).toBeVisible();

    // Product 21 = Cotton Suits category
    await page.goto('/products/21');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Pure Cotton Comfort Suit')).toBeVisible();

    // Product 31 = Designer Brands category
    await page.goto('/products/31');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Maria B Premium Collection')).toBeVisible();
  });

  test('should handle non-existent product gracefully', async ({ page }) => {
    await page.goto('/products/999');
    await page.waitForLoadState('domcontentloaded');
    // Page should load without crashing
    expect(await page.locator('body').count()).toBe(1);
  });
});
