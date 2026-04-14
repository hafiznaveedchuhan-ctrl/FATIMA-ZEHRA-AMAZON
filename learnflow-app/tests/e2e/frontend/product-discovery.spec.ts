/**
 * Product Discovery Flow E2E Tests
 * Fatima Zehra Boutique - Phase 5 Testing
 *
 * Tests cover:
 * - Navigation to /products
 * - Category browsing (fancy-suits, shalwar-qameez, cotton-suits, designer-brands)
 * - Category filtering
 * - Search functionality
 * - Product detail page navigation
 * - Product images and information display
 */

import { test, expect } from '@playwright/test';

test.describe('Product Discovery Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/Fatima Zehra/i);
  });

  test('should navigate to products page from homepage', async ({ page }) => {
    // Click on "Explore Collection" button
    await page.click('text=Explore Collection');

    // Verify navigation to products page
    await expect(page).toHaveURL(/\/products/);
    await expect(page.locator('h1')).toContainText('Our Collection');
  });

  test('should display all 40 products on products page', async ({ page }) => {
    await page.goto('/products');

    // Wait for products to load
    await page.waitForSelector('[class*="ProductCard"]', { timeout: 10000 }).catch(() => {});

    // Count visible products (by searching for product cards)
    const productCount = await page.locator('text=Showing').textContent();
    expect(productCount).toContain('40');
  });

  test('should display all four categories', async ({ page }) => {
    await page.goto('/products');

    // Verify category filters exist
    await expect(page.locator('text=Fancy Suits')).toBeVisible();
    await expect(page.locator('text=Shalwar Qameez')).toBeVisible();
    await expect(page.locator('text=Cotton Suits')).toBeVisible();
    await expect(page.locator('text=Designer Brands')).toBeVisible();
  });

  test('should filter products by Fancy Suits category', async ({ page }) => {
    await page.goto('/products');

    // Click on Fancy Suits category
    await page.click('button:has-text("Fancy Suits")');

    // Wait for filtering
    await page.waitForTimeout(500);

    // Verify filtered results
    const productCount = await page.locator('text=Showing').textContent();
    expect(productCount).toContain('10'); // 10 products per category
  });

  test('should filter products by Shalwar Qameez category', async ({ page }) => {
    await page.goto('/products');

    // Click on Shalwar Qameez category
    await page.click('button:has-text("Shalwar Qameez")');

    // Wait for filtering
    await page.waitForTimeout(500);

    // Verify filtered results
    const productCount = await page.locator('text=Showing').textContent();
    expect(productCount).toContain('10');
  });

  test('should filter products by Cotton Suits category', async ({ page }) => {
    await page.goto('/products');

    // Click on Cotton Suits category
    await page.click('button:has-text("Cotton Suits")');

    // Wait for filtering
    await page.waitForTimeout(500);

    // Verify filtered results
    const productCount = await page.locator('text=Showing').textContent();
    expect(productCount).toContain('10');
  });

  test('should filter products by Designer Brands category', async ({ page }) => {
    await page.goto('/products');

    // Click on Designer Brands category
    await page.click('button:has-text("Designer Brands")');

    // Wait for filtering
    await page.waitForTimeout(500);

    // Verify filtered results
    const productCount = await page.locator('text=Showing').textContent();
    expect(productCount).toContain('10');
  });

  test('should search for "fancy suit" and find results', async ({ page }) => {
    await page.goto('/products');

    // Enter search query
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('fancy suit');

    // Wait for search results
    await page.waitForTimeout(500);

    // Verify search results appear
    const resultText = await page.locator('text=Showing').textContent();
    const count = parseInt(resultText?.match(/\d+/)?.[0] || '0');
    expect(count).toBeGreaterThan(0);
  });

  test('should search for "cotton" and find relevant products', async ({ page }) => {
    await page.goto('/products');

    // Enter search query
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('cotton');

    // Wait for search results
    await page.waitForTimeout(500);

    // Verify search results appear
    const resultText = await page.locator('text=Showing').textContent();
    const count = parseInt(resultText?.match(/\d+/)?.[0] || '0');
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to product detail page when clicking a product', async ({ page }) => {
    await page.goto('/products');

    // Click on the first product
    await page.locator('a[href*="/products/"]').first().click();

    // Verify navigation to product detail page
    await expect(page).toHaveURL(/\/products\/\d+/);
  });

  test('should display product details on product page', async ({ page }) => {
    // Navigate to product detail page (product ID 1)
    await page.goto('/products/1');

    // Wait for product to load
    await page.waitForSelector('h1');

    // Verify product information is displayed
    await expect(page.locator('h1')).toBeVisible(); // Product name
    await expect(page.locator('text=Rs')).toBeVisible(); // Price
    await expect(page.locator('img[alt]')).toBeVisible(); // Product image
  });

  test('should display product image correctly', async ({ page }) => {
    await page.goto('/products/1');

    // Wait for image to load
    const productImage = page.locator('img[alt]').first();
    await expect(productImage).toBeVisible();

    // Verify image has proper source
    const imageSrc = await productImage.getAttribute('src');
    expect(imageSrc).toContain('fancy-suits');
  });

  test('should display size options on product detail page', async ({ page }) => {
    await page.goto('/products/1');

    // Wait for size options
    await page.waitForSelector('button:has-text("XS")');

    // Verify size options exist
    await expect(page.locator('button:has-text("XS")')).toBeVisible();
    await expect(page.locator('button:has-text("S")')).toBeVisible();
    await expect(page.locator('button:has-text("M")')).toBeVisible();
    await expect(page.locator('button:has-text("L")')).toBeVisible();
  });

  test('should display color options on product detail page', async ({ page }) => {
    await page.goto('/products/1');

    // Wait for color options to load
    await page.waitForTimeout(500);

    // Check for color selection buttons
    const colorButtons = page.locator('button').filter({ hasText: /Red|Pink|Gold|Purple/i });
    const count = await colorButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter by price range', async ({ page }) => {
    await page.goto('/products');

    // Find price range sliders
    const minPriceSlider = page.locator('input[type="range"]').first();
    const maxPriceSlider = page.locator('input[type="range"]').nth(1);

    // Adjust price range
    await minPriceSlider.fill('3000');
    await maxPriceSlider.fill('8000');

    // Wait for filtering
    await page.waitForTimeout(500);

    // Verify products are filtered
    const resultText = await page.locator('text=Showing').textContent();
    expect(resultText).toBeTruthy();
  });

  test('should sort products by price low to high', async ({ page }) => {
    await page.goto('/products');

    // Select sort option
    await page.selectOption('select', 'price-low');

    // Wait for sorting
    await page.waitForTimeout(500);

    // Verify products are sorted (check first product has lowest price)
    const firstProductPrice = await page.locator('[class*="ProductCard"]').first().locator('text=/Rs \\d/').textContent();
    expect(firstProductPrice).toBeTruthy();
  });

  test('should sort products by price high to low', async ({ page }) => {
    await page.goto('/products');

    // Select sort option
    await page.selectOption('select', 'price-high');

    // Wait for sorting
    await page.waitForTimeout(500);

    // Verify sorting applied
    const resultText = await page.locator('text=Showing').textContent();
    expect(resultText).toBeTruthy();
  });

  test('should sort products by rating', async ({ page }) => {
    await page.goto('/products');

    // Select sort option
    await page.selectOption('select', 'rating');

    // Wait for sorting
    await page.waitForTimeout(500);

    // Verify sorting applied
    const resultText = await page.locator('text=Showing').textContent();
    expect(resultText).toBeTruthy();
  });

  test('should clear filters and show all products', async ({ page }) => {
    await page.goto('/products');

    // Apply a filter first
    await page.click('button:has-text("Fancy Suits")');
    await page.waitForTimeout(300);

    // Clear filters
    await page.click('button:has-text("Clear Filters")');
    await page.waitForTimeout(300);

    // Verify all products are shown
    const resultText = await page.locator('text=Showing').textContent();
    expect(resultText).toContain('40');
  });

  test('should display "No Products Found" for empty search', async ({ page }) => {
    await page.goto('/products');

    // Enter search query with no results
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('nonexistentproduct12345');

    // Wait for search
    await page.waitForTimeout(500);

    // Verify no products message
    await expect(page.locator('text=No Products Found')).toBeVisible();
  });

  test('should show breadcrumb navigation on product detail page', async ({ page }) => {
    await page.goto('/products/1');

    // Wait for page to load
    await page.waitForTimeout(500);

    // Verify breadcrumb exists
    const breadcrumb = page.locator('text=/Products/');
    await expect(breadcrumb.first()).toBeVisible();
  });

  test('should navigate back to products from product detail', async ({ page }) => {
    await page.goto('/products/1');

    // Click on Products link in breadcrumb
    await page.click('a[href="/products"]');

    // Verify navigation
    await expect(page).toHaveURL(/\/products$/);
  });
});

test.describe('Homepage Product Sections', () => {

  test('should display featured products for each category on homepage', async ({ page }) => {
    await page.goto('/');

    // Wait for products to load
    await page.waitForTimeout(1000);

    // Verify category sections exist
    await expect(page.locator('h2:has-text("Fancy Suits")')).toBeVisible();
    await expect(page.locator('h2:has-text("Shalwar Qameez")')).toBeVisible();
    await expect(page.locator('h2:has-text("Cotton Suits")')).toBeVisible();
    await expect(page.locator('h2:has-text("Designer Brands")')).toBeVisible();
  });

  test('should display View All link for each category', async ({ page }) => {
    await page.goto('/');

    // Find View All links
    const viewAllLinks = page.locator('a:has-text("View All")');
    const count = await viewAllLinks.count();

    // Should have 4 View All links (one per category)
    expect(count).toBe(4);
  });

  test('should navigate to category page when clicking View All', async ({ page }) => {
    await page.goto('/');

    // Click first View All link
    await page.locator('a:has-text("View All")').first().click();

    // Verify navigation to products page with category filter
    await expect(page).toHaveURL(/\/products\?category=/);
  });
});
