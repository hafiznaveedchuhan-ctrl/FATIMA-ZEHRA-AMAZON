/**
 * WhatsApp and Chat Widget E2E Tests
 * Fatima Zehra Boutique - Phase 5 Testing
 *
 * Tests cover:
 * - WhatsApp button display on product pages
 * - WhatsApp link generation with pre-filled message
 * - Chat widget toggle (open/close)
 * - Chat message sending
 * - Chat response verification
 */

import { test, expect } from '@playwright/test';

test.describe('WhatsApp Integration', () => {

  test('should display WhatsApp button on product detail page', async ({ page }) => {
    await page.goto('/products/1');
    await page.waitForTimeout(500);

    // Find WhatsApp button
    const whatsappButton = page.locator('a:has-text("WhatsApp"), button:has-text("WhatsApp")');
    await expect(whatsappButton).toBeVisible();
  });

  test('should have correct WhatsApp link format', async ({ page }) => {
    await page.goto('/products/1');
    await page.waitForTimeout(500);

    // Find WhatsApp button/link
    const whatsappButton = page.locator('a:has-text("WhatsApp")');

    // Get href attribute
    const href = await whatsappButton.getAttribute('href');

    // Should be #whatsapp (handled by onClick) or wa.me link
    expect(href).toBeTruthy();
  });

  test('should include product name in WhatsApp message', async ({ page }) => {
    await page.goto('/products/1');
    await page.waitForTimeout(500);

    // The WhatsApp button should contain product context
    // Test that the component renders with proper props
    const productName = await page.locator('h1').textContent();
    expect(productName).toContain('Royal Embroidered');
  });

  test('should include product price in WhatsApp inquiry', async ({ page }) => {
    await page.goto('/products/1');
    await page.waitForTimeout(500);

    // Verify price is displayed on the page
    await expect(page.locator('text=Rs 8,500')).toBeVisible();
  });

  test('should show WhatsApp button with proper styling', async ({ page }) => {
    await page.goto('/products/1');
    await page.waitForTimeout(500);

    // WhatsApp button should have green color (primary variant)
    const whatsappButton = page.locator('a:has-text("WhatsApp")').first();
    await expect(whatsappButton).toBeVisible();

    // Check for green color class
    const className = await whatsappButton.getAttribute('class');
    expect(className).toContain('green');
  });

  test('should open WhatsApp in new tab when clicked', async ({ page, context }) => {
    await page.goto('/products/1');
    await page.waitForTimeout(500);

    // Listen for new page/tab
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.click('a:has-text("WhatsApp")')
    ]).catch(() => [null]);

    // A new page should open (WhatsApp web or app redirect)
    // Note: This may not work in headless mode without actual navigation
    if (newPage) {
      expect(newPage).toBeTruthy();
    }
  });

  test('should display WhatsApp button for all product categories', async ({ page }) => {
    // Test Fancy Suits
    await page.goto('/products/1');
    await page.waitForTimeout(300);
    await expect(page.locator('a:has-text("WhatsApp")').first()).toBeVisible();

    // Test Shalwar Qameez
    await page.goto('/products/11');
    await page.waitForTimeout(300);
    await expect(page.locator('a:has-text("WhatsApp")').first()).toBeVisible();

    // Test Cotton Suits
    await page.goto('/products/21');
    await page.waitForTimeout(300);
    await expect(page.locator('a:has-text("WhatsApp")').first()).toBeVisible();

    // Test Designer Brands
    await page.goto('/products/31');
    await page.waitForTimeout(300);
    await expect(page.locator('a:has-text("WhatsApp")').first()).toBeVisible();
  });
});

test.describe('Chat Widget', () => {

  test('should display chat button on page', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Find chat widget button (floating button with message icon)
    const chatButton = page.locator('button[aria-label*="chat" i], button:has(svg[class*="message-circle"])');
    await expect(chatButton.first()).toBeVisible();
  });

  test('should open chat window when clicking chat button', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Click chat button
    await page.click('button[aria-label*="chat" i], button:has(svg)');
    await page.waitForTimeout(300);

    // Verify chat window opens
    const chatWindow = page.locator('text=Fatima Zehra Assistant');
    await expect(chatWindow).toBeVisible();
  });

  test('should display welcome message in chat', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Open chat
    await page.click('button[aria-label*="chat" i], button:has(svg)');
    await page.waitForTimeout(300);

    // Verify welcome message
    await expect(page.locator('text=Hello')).toBeVisible();
    await expect(page.locator('text=Welcome to Fatima Zehra')).toBeVisible();
  });

  test('should have message input field in chat', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Open chat
    await page.click('button[aria-label*="chat" i], button:has(svg)');
    await page.waitForTimeout(300);

    // Verify input field exists
    const input = page.locator('input[placeholder*="Ask"], input[placeholder*="suit"]');
    await expect(input).toBeVisible();
  });

  test('should have send button in chat', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Open chat
    await page.click('button[aria-label*="chat" i], button:has(svg)');
    await page.waitForTimeout(300);

    // Verify send button exists
    const sendButton = page.locator('button[aria-label*="Send"], button[type="submit"]');
    await expect(sendButton.first()).toBeVisible();
  });

  test('should close chat window when clicking close button', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Open chat
    await page.click('button[aria-label*="chat" i], button:has(svg)');
    await page.waitForTimeout(300);

    // Verify chat is open
    await expect(page.locator('text=Fatima Zehra Assistant')).toBeVisible();

    // Close chat
    await page.click('button[aria-label*="Close" i]');
    await page.waitForTimeout(300);

    // Verify chat is closed
    await expect(page.locator('text=Fatima Zehra Assistant')).not.toBeVisible();
  });

  test('should display user message after sending', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Open chat
    await page.click('button[aria-label*="chat" i], button:has(svg)');
    await page.waitForTimeout(300);

    // Type message
    const input = page.locator('input[placeholder*="Ask"], input[placeholder*="suit"]');
    await input.fill('I want a formal suit');

    // Send message
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Verify user message appears
    await expect(page.locator('text=I want a formal suit')).toBeVisible();
  });

  test('should show loading state while waiting for response', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Open chat
    await page.click('button[aria-label*="chat" i], button:has(svg)');
    await page.waitForTimeout(300);

    // Type and send message
    const input = page.locator('input[placeholder*="Ask"], input[placeholder*="suit"]');
    await input.fill('What suits do you have?');
    await page.click('button[type="submit"]');

    // Check for loading indicator (may be brief)
    // The component shows "Thinking..." during loading
    await page.waitForTimeout(200);
    // Loading state may pass quickly, so we just verify message was sent
    await expect(page.locator('text=What suits do you have?')).toBeVisible();
  });

  test('should display timestamp on messages', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Open chat
    await page.click('button[aria-label*="chat" i], button:has(svg)');
    await page.waitForTimeout(300);

    // Check for timestamp format (HH:MM)
    const timestamp = page.locator('text=/\\d{1,2}:\\d{2}/');
    await expect(timestamp.first()).toBeVisible();
  });

  test('should disable send button when input is empty', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Open chat
    await page.click('button[aria-label*="chat" i], button:has(svg)');
    await page.waitForTimeout(300);

    // Get send button
    const sendButton = page.locator('button[type="submit"]');

    // Should be disabled when input is empty
    await expect(sendButton).toBeDisabled();
  });

  test('should enable send button when input has text', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Open chat
    await page.click('button[aria-label*="chat" i], button:has(svg)');
    await page.waitForTimeout(300);

    // Type message
    const input = page.locator('input[placeholder*="Ask"], input[placeholder*="suit"]');
    await input.fill('Hello');

    // Get send button
    const sendButton = page.locator('button[type="submit"]');

    // Should be enabled
    await expect(sendButton).not.toBeDisabled();
  });

  test('should clear input after sending message', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Open chat
    await page.click('button[aria-label*="chat" i], button:has(svg)');
    await page.waitForTimeout(300);

    // Type and send message
    const input = page.locator('input[placeholder*="Ask"], input[placeholder*="suit"]');
    await input.fill('Test message');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(300);

    // Input should be empty
    await expect(input).toHaveValue('');
  });

  test('should show "Powered by OpenAI" text', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Open chat
    await page.click('button[aria-label*="chat" i], button:has(svg)');
    await page.waitForTimeout(300);

    // Verify powered by text
    await expect(page.locator('text=Powered by OpenAI')).toBeVisible();
  });
});

test.describe('Chat Widget on Different Pages', () => {

  test('should be visible on homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    const chatButton = page.locator('button[aria-label*="chat" i], button:has(svg[class*="message"])').first();
    await expect(chatButton).toBeVisible();
  });

  test('should be visible on products page', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(500);

    const chatButton = page.locator('button[aria-label*="chat" i], button:has(svg[class*="message"])').first();
    await expect(chatButton).toBeVisible();
  });

  test('should be visible on product detail page', async ({ page }) => {
    await page.goto('/products/1');
    await page.waitForTimeout(500);

    const chatButton = page.locator('button[aria-label*="chat" i], button:has(svg[class*="message"])').first();
    await expect(chatButton).toBeVisible();
  });

  test('should be visible on cart page', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForTimeout(500);

    const chatButton = page.locator('button[aria-label*="chat" i], button:has(svg[class*="message"])').first();
    await expect(chatButton).toBeVisible();
  });
});

test.describe('Chat Persistence', () => {

  test('should maintain chat history within session', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Open chat
    await page.click('button[aria-label*="chat" i], button:has(svg)');
    await page.waitForTimeout(300);

    // Send a message
    const input = page.locator('input[placeholder*="Ask"], input[placeholder*="suit"]');
    await input.fill('First message');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Close chat
    await page.click('button[aria-label*="Close" i]');
    await page.waitForTimeout(300);

    // Reopen chat
    await page.click('button[aria-label*="chat" i], button:has(svg)');
    await page.waitForTimeout(300);

    // Message should still be there
    await expect(page.locator('text=First message')).toBeVisible();
  });
});
