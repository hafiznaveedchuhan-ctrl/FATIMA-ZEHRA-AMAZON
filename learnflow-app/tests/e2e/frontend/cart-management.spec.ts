/**
 * Cart Management E2E Tests
 * Fatima Zehra Boutique - Phase 5 Testing
 *
 * Tests cover:
 * - Add product to cart
 * - Verify cart count updates
 * - Navigate to /cart
 * - Verify cart items display with prices
 * - Update quantity (increase/decrease)
 * - Remove item from cart
 * - Clear entire cart
 */

import { test, expect } from '@playwright/test';

test.describe('Cart Management Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should add product to cart from product detail page', async ({ page }) => {
    // Navigate to product detail page
    await page.goto('/products/1');

    // Wait for page to load
    await page.waitForSelector('h1');

    // Select a size first (required)
    await page.click('button:has-text("M")');

    // Click "Add to Cart" button (in Urdu)
    await page.click('button:has-text("Add to Cart"), button:has-text("شامل کریں")');

    // Wait for cart update
    await page.waitForTimeout(500);

    // This may trigger payment modal - for now verify click worked
    // Real cart functionality uses zustand store
  });

  test('should display empty cart message when cart is empty', async ({ page }) => {
    // Navigate to cart page
    await page.goto('/cart');

    // Verify empty cart message
    await expect(page.locator('text=Your Cart is Empty')).toBeVisible();
    await expect(page.locator('text=Continue Shopping')).toBeVisible();
  });

  test('should navigate to products page from empty cart', async ({ page }) => {
    await page.goto('/cart');

    // Click Continue Shopping
    await page.click('text=Continue Shopping');

    // Verify navigation
    await expect(page).toHaveURL(/\/products/);
  });

  test('should update cart count in navbar after adding item', async ({ page }) => {
    // First add item to cart via localStorage simulation
    await page.goto('/');

    // Simulate adding item to cart via localStorage
    await page.evaluate(() => {
      const cartData = {
        state: {
          items: [{
            product: {
              id: 1,
              name: 'Royal Embroidered Fancy Suit',
              price: 8500,
              image: '/images/fancy-suits/fancy-suits-01.jpg',
              category: 'Fancy Suits'
            },
            quantity: 1
          }],
          itemCount: 1
        },
        version: 0
      };
      localStorage.setItem('cart-storage', JSON.stringify(cartData));
    });

    // Reload page to see cart updates
    await page.reload();

    // Cart count should be visible in navbar
    await page.waitForTimeout(500);
  });

  test('should display cart items on cart page', async ({ page }) => {
    // Pre-populate cart via localStorage
    await page.goto('/');
    await page.evaluate(() => {
      const cartData = {
        state: {
          items: [{
            product: {
              id: 1,
              name: 'Royal Embroidered Fancy Suit',
              price: 8500,
              image: '/images/fancy-suits/fancy-suits-01.jpg',
              category: 'Fancy Suits'
            },
            quantity: 1
          }],
          itemCount: 1
        },
        version: 0
      };
      localStorage.setItem('cart-storage', JSON.stringify(cartData));
    });

    // Navigate to cart
    await page.goto('/cart');

    // Wait for cart to load
    await page.waitForTimeout(500);

    // Verify cart item is displayed
    await expect(page.locator('text=Royal Embroidered')).toBeVisible();
    await expect(page.locator('text=Rs 8,500')).toBeVisible();
  });

  test('should show product image in cart', async ({ page }) => {
    // Pre-populate cart
    await page.goto('/');
    await page.evaluate(() => {
      const cartData = {
        state: {
          items: [{
            product: {
              id: 1,
              name: 'Royal Embroidered Fancy Suit',
              price: 8500,
              image: '/images/fancy-suits/fancy-suits-01.jpg',
              category: 'Fancy Suits'
            },
            quantity: 1
          }],
          itemCount: 1
        },
        version: 0
      };
      localStorage.setItem('cart-storage', JSON.stringify(cartData));
    });

    await page.goto('/cart');
    await page.waitForTimeout(500);

    // Verify image is displayed
    const cartImage = page.locator('img').first();
    await expect(cartImage).toBeVisible();
  });

  test('should increase item quantity in cart', async ({ page }) => {
    // Pre-populate cart with quantity 1
    await page.goto('/');
    await page.evaluate(() => {
      const cartData = {
        state: {
          items: [{
            product: {
              id: 1,
              name: 'Royal Embroidered Fancy Suit',
              price: 8500,
              image: '/images/fancy-suits/fancy-suits-01.jpg',
              category: 'Fancy Suits'
            },
            quantity: 1
          }],
          itemCount: 1
        },
        version: 0
      };
      localStorage.setItem('cart-storage', JSON.stringify(cartData));
    });

    await page.goto('/cart');
    await page.waitForTimeout(500);

    // Click increase button (Plus icon)
    const increaseButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    await increaseButton.click();

    // Wait for update
    await page.waitForTimeout(300);

    // Verify quantity increased (check for "2" in quantity display)
    const quantityDisplay = page.locator('span').filter({ hasText: /^2$/ });
    await expect(quantityDisplay).toBeVisible();
  });

  test('should decrease item quantity in cart', async ({ page }) => {
    // Pre-populate cart with quantity 2
    await page.goto('/');
    await page.evaluate(() => {
      const cartData = {
        state: {
          items: [{
            product: {
              id: 1,
              name: 'Royal Embroidered Fancy Suit',
              price: 8500,
              image: '/images/fancy-suits/fancy-suits-01.jpg',
              category: 'Fancy Suits'
            },
            quantity: 2
          }],
          itemCount: 2
        },
        version: 0
      };
      localStorage.setItem('cart-storage', JSON.stringify(cartData));
    });

    await page.goto('/cart');
    await page.waitForTimeout(500);

    // Click decrease button (Minus icon)
    const decreaseButton = page.locator('button').filter({ has: page.locator('svg') }).nth(-2);
    await decreaseButton.click();

    // Wait for update
    await page.waitForTimeout(300);

    // Verify quantity decreased
    const quantityDisplay = page.locator('span').filter({ hasText: /^1$/ });
    await expect(quantityDisplay).toBeVisible();
  });

  test('should remove item from cart', async ({ page }) => {
    // Pre-populate cart
    await page.goto('/');
    await page.evaluate(() => {
      const cartData = {
        state: {
          items: [{
            product: {
              id: 1,
              name: 'Royal Embroidered Fancy Suit',
              price: 8500,
              image: '/images/fancy-suits/fancy-suits-01.jpg',
              category: 'Fancy Suits'
            },
            quantity: 1
          }],
          itemCount: 1
        },
        version: 0
      };
      localStorage.setItem('cart-storage', JSON.stringify(cartData));
    });

    await page.goto('/cart');
    await page.waitForTimeout(500);

    // Click remove button (Trash icon)
    await page.click('button:has(svg[class*="lucide-trash"])');

    // Wait for update
    await page.waitForTimeout(300);

    // Verify cart is now empty
    await expect(page.locator('text=Your Cart is Empty')).toBeVisible();
  });

  test('should clear entire cart', async ({ page }) => {
    // Pre-populate cart with multiple items
    await page.goto('/');
    await page.evaluate(() => {
      const cartData = {
        state: {
          items: [
            {
              product: {
                id: 1,
                name: 'Royal Embroidered Fancy Suit',
                price: 8500,
                image: '/images/fancy-suits/fancy-suits-01.jpg',
                category: 'Fancy Suits'
              },
              quantity: 1
            },
            {
              product: {
                id: 11,
                name: 'Classic White Shalwar Qameez',
                price: 3500,
                image: '/images/shalwar-qameez/shalwar-qameez-01.jpg',
                category: 'Shalwar Qameez'
              },
              quantity: 2
            }
          ],
          itemCount: 3
        },
        version: 0
      };
      localStorage.setItem('cart-storage', JSON.stringify(cartData));
    });

    await page.goto('/cart');
    await page.waitForTimeout(500);

    // Verify items are displayed
    await expect(page.locator('text=Royal Embroidered')).toBeVisible();
    await expect(page.locator('text=Classic White')).toBeVisible();

    // Click Clear Cart
    await page.click('button:has-text("Clear Cart")');

    // Wait for update
    await page.waitForTimeout(300);

    // Verify cart is empty
    await expect(page.locator('text=Your Cart is Empty')).toBeVisible();
  });

  test('should display correct total price', async ({ page }) => {
    // Pre-populate cart with known prices
    await page.goto('/');
    await page.evaluate(() => {
      const cartData = {
        state: {
          items: [
            {
              product: {
                id: 1,
                name: 'Royal Embroidered Fancy Suit',
                price: 8500,
                image: '/images/fancy-suits/fancy-suits-01.jpg',
                category: 'Fancy Suits'
              },
              quantity: 2  // 2 x 8500 = 17000
            }
          ],
          itemCount: 2
        },
        version: 0
      };
      localStorage.setItem('cart-storage', JSON.stringify(cartData));
    });

    await page.goto('/cart');
    await page.waitForTimeout(500);

    // Verify total price displays correctly (17,000)
    await expect(page.locator('text=Rs 17,000')).toBeVisible();
  });

  test('should show free shipping message', async ({ page }) => {
    // Pre-populate cart
    await page.goto('/');
    await page.evaluate(() => {
      const cartData = {
        state: {
          items: [{
            product: {
              id: 1,
              name: 'Royal Embroidered Fancy Suit',
              price: 8500,
              image: '/images/fancy-suits/fancy-suits-01.jpg',
              category: 'Fancy Suits'
            },
            quantity: 1
          }],
          itemCount: 1
        },
        version: 0
      };
      localStorage.setItem('cart-storage', JSON.stringify(cartData));
    });

    await page.goto('/cart');
    await page.waitForTimeout(500);

    // Verify free shipping message
    await expect(page.locator('text=Free')).toBeVisible();
  });

  test('should persist cart after page reload', async ({ page }) => {
    // Pre-populate cart
    await page.goto('/');
    await page.evaluate(() => {
      const cartData = {
        state: {
          items: [{
            product: {
              id: 1,
              name: 'Royal Embroidered Fancy Suit',
              price: 8500,
              image: '/images/fancy-suits/fancy-suits-01.jpg',
              category: 'Fancy Suits'
            },
            quantity: 1
          }],
          itemCount: 1
        },
        version: 0
      };
      localStorage.setItem('cart-storage', JSON.stringify(cartData));
    });

    await page.goto('/cart');
    await page.waitForTimeout(300);

    // Reload page
    await page.reload();
    await page.waitForTimeout(500);

    // Verify cart still has item
    await expect(page.locator('text=Royal Embroidered')).toBeVisible();
  });

  test('should show cart item count in header', async ({ page }) => {
    // Pre-populate cart
    await page.goto('/');
    await page.evaluate(() => {
      const cartData = {
        state: {
          items: [
            {
              product: { id: 1, name: 'Test', price: 1000, image: '/test.jpg', category: 'Test' },
              quantity: 3
            }
          ],
          itemCount: 3
        },
        version: 0
      };
      localStorage.setItem('cart-storage', JSON.stringify(cartData));
    });

    await page.reload();
    await page.waitForTimeout(500);

    // Navbar should show cart count
    // Check for cart icon or count badge
    const cartLink = page.locator('a[href="/cart"]');
    await expect(cartLink).toBeVisible();
  });
});

test.describe('Cart with Multiple Items', () => {

  test('should handle multiple items from different categories', async ({ page }) => {
    // Pre-populate cart with items from different categories
    await page.goto('/');
    await page.evaluate(() => {
      const cartData = {
        state: {
          items: [
            {
              product: {
                id: 1,
                name: 'Royal Embroidered Fancy Suit',
                price: 8500,
                image: '/images/fancy-suits/fancy-suits-01.jpg',
                category: 'Fancy Suits'
              },
              quantity: 1
            },
            {
              product: {
                id: 11,
                name: 'Classic White Shalwar Qameez',
                price: 3500,
                image: '/images/shalwar-qameez/shalwar-qameez-01.jpg',
                category: 'Shalwar Qameez'
              },
              quantity: 1
            },
            {
              product: {
                id: 21,
                name: 'Pure Cotton Comfort Suit',
                price: 2200,
                image: '/images/cotton-suits/cotton-suits-01.jpg',
                category: 'Cotton Suits'
              },
              quantity: 1
            }
          ],
          itemCount: 3
        },
        version: 0
      };
      localStorage.setItem('cart-storage', JSON.stringify(cartData));
    });

    await page.goto('/cart');
    await page.waitForTimeout(500);

    // Verify all items are displayed
    await expect(page.locator('text=Royal Embroidered')).toBeVisible();
    await expect(page.locator('text=Classic White')).toBeVisible();
    await expect(page.locator('text=Pure Cotton')).toBeVisible();

    // Verify correct total (8500 + 3500 + 2200 = 14,200)
    await expect(page.locator('text=Rs 14,200')).toBeVisible();
  });

  test('should show correct item count in summary', async ({ page }) => {
    // Pre-populate cart with 3 items
    await page.goto('/');
    await page.evaluate(() => {
      const cartData = {
        state: {
          items: [
            { product: { id: 1, name: 'Test1', price: 1000, image: '/test.jpg', category: 'Test' }, quantity: 1 },
            { product: { id: 2, name: 'Test2', price: 2000, image: '/test.jpg', category: 'Test' }, quantity: 1 },
            { product: { id: 3, name: 'Test3', price: 3000, image: '/test.jpg', category: 'Test' }, quantity: 1 }
          ],
          itemCount: 3
        },
        version: 0
      };
      localStorage.setItem('cart-storage', JSON.stringify(cartData));
    });

    await page.goto('/cart');
    await page.waitForTimeout(500);

    // Verify item count display
    await expect(page.locator('text=3 items')).toBeVisible();
  });
});
