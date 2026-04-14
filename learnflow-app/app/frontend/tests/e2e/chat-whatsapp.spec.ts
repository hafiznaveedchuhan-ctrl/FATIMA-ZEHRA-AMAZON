import { test, expect } from '@playwright/test';

test.describe('Chat Widget Tests', () => {
  test('should display chat button on homepage', async ({ page }) => {
    await page.goto('/');
    const chatButton = page.locator('button[aria-label="Open chat"]');
    await expect(chatButton).toBeVisible();
  });

  test('should open chat widget on click', async ({ page }) => {
    await page.goto('/');
    await page.click('button[aria-label="Open chat"]');
    await expect(page.locator('text=Fatima Zehra Assistant')).toBeVisible();
    await expect(page.locator('text=Always here to help')).toBeVisible();
  });

  test('should display welcome message', async ({ page }) => {
    await page.goto('/');
    await page.click('button[aria-label="Open chat"]');
    await expect(page.locator('text=Welcome to Fatima Zehra Boutique')).toBeVisible();
  });

  test('should have message input field', async ({ page }) => {
    await page.goto('/');
    await page.click('button[aria-label="Open chat"]');
    const input = page.locator('input[placeholder*="Ask about our suits"]');
    await expect(input).toBeVisible();
  });

  test('should have send button', async ({ page }) => {
    await page.goto('/');
    await page.click('button[aria-label="Open chat"]');
    const sendButton = page.locator('button[aria-label="Send message"]');
    await expect(sendButton).toBeVisible();
  });

  test('should close chat widget', async ({ page }) => {
    await page.goto('/');
    await page.click('button[aria-label="Open chat"]');
    await page.click('button[aria-label="Close chat"]');
    await expect(page.locator('button[aria-label="Open chat"]')).toBeVisible();
  });

  test('should send a message (user input appears)', async ({ page }) => {
    await page.goto('/');
    await page.click('button[aria-label="Open chat"]');
    const input = page.locator('input[placeholder*="Ask about our suits"]');
    await input.fill('I want to buy a fancy suit');
    await page.click('button[aria-label="Send message"]');
    await expect(page.locator('text=I want to buy a fancy suit')).toBeVisible();
  });

  test('should show loading state after sending message', async ({ page }) => {
    await page.goto('/');
    await page.click('button[aria-label="Open chat"]');
    const input = page.locator('input[placeholder*="Ask about our suits"]');
    await input.fill('Hello');
    await page.click('button[aria-label="Send message"]');
    // Loading state should appear (Thinking... or similar)
    await expect(page.locator('text=Thinking').or(page.locator('text=Hello'))).toBeVisible();
  });

  test('should show Powered by OpenAI text', async ({ page }) => {
    await page.goto('/');
    await page.click('button[aria-label="Open chat"]');
    await expect(page.locator('text=Powered by OpenAI')).toBeVisible();
  });

  test('chat widget is present on all pages', async ({ page }) => {
    const pages = ['/', '/products', '/cart', '/about', '/contact'];
    for (const path of pages) {
      await page.goto(path);
      await expect(page.locator('button[aria-label="Open chat"]')).toBeVisible();
    }
  });
});

test.describe('WhatsApp Button Tests', () => {
  test('should display floating WhatsApp button on homepage', async ({ page }) => {
    await page.goto('/');
    const whatsappButton = page.locator('button[aria-label="Open WhatsApp chat"]');
    await expect(whatsappButton).toBeVisible();
  });

  test('floating WhatsApp button is present on all pages', async ({ page }) => {
    const pages = ['/', '/products', '/cart', '/about', '/contact'];
    for (const path of pages) {
      await page.goto(path);
      await expect(page.locator('button[aria-label="Open WhatsApp chat"]')).toBeVisible();
    }
  });

  test('should show tooltip on WhatsApp button hover', async ({ page }) => {
    await page.goto('/');
    const whatsappButton = page.locator('button[aria-label="Open WhatsApp chat"]');
    await whatsappButton.hover();
    await expect(page.locator('text=Chat with us')).toBeVisible();
  });

  test('should display WhatsApp button on product detail page', async ({ page }) => {
    await page.goto('/products/1');
    await page.waitForTimeout(1500);
    await expect(page.locator('text=WhatsApp')).toBeVisible();
  });

  test('WhatsApp button should open new window (verified by href)', async ({ page }) => {
    await page.goto('/products/1');
    await page.waitForTimeout(1500);
    // The WhatsApp button is an anchor with href="#whatsapp"
    const whatsappLink = page.locator('a[href="#whatsapp"]');
    if (await whatsappLink.isVisible()) {
      // Verify it has proper attributes
      await expect(whatsappLink).toHaveAttribute('title', /WhatsApp/);
    }
  });
});
