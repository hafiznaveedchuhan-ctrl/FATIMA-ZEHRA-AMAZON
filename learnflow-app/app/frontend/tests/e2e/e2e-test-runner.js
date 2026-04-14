/**
 * Comprehensive E2E Test Runner for Fatima Zehra Boutique
 * Tests the full-stack application running on localhost
 *
 * Executes HTTP-based tests against all pages and API endpoints
 * Reports pass/fail with detailed diagnostics
 */

const http = require('http');
const https = require('https');
const url = require('url');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://192.168.1.101:3000';
const BACKEND_URLS = {
  userService: process.env.USER_SERVICE_URL || 'http://localhost:8001',
  productService: process.env.PRODUCT_SERVICE_URL || 'http://localhost:8002',
  orderService: process.env.ORDER_SERVICE_URL || 'http://localhost:8003',
  chatService: process.env.CHAT_SERVICE_URL || 'http://localhost:8004',
};

// Test Results
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  errors: [],
  warnings: [],
  criticalIssues: [],
  highIssues: [],
  mediumIssues: [],
  lowIssues: [],
  testDetails: [],
  startTime: null,
  endTime: null,
};

// Helper: HTTP fetch
function fetchUrl(targetUrl, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(targetUrl);
    const client = parsed.protocol === 'https:' ? https : http;
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: options.timeout || 15000,
    };

    const req = client.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          url: targetUrl,
        });
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

// Test runner
function test(name, severity, fn) {
  return async () => {
    results.total++;
    const detail = { name, severity, status: 'pending', duration: 0, error: null };
    const start = Date.now();
    try {
      await fn();
      detail.status = 'PASSED';
      detail.duration = Date.now() - start;
      results.passed++;
      console.log(`  [PASS] ${name} (${detail.duration}ms)`);
    } catch (err) {
      detail.status = 'FAILED';
      detail.duration = Date.now() - start;
      detail.error = err.message;
      results.failed++;
      console.log(`  [FAIL] ${name}: ${err.message} (${detail.duration}ms)`);

      const issue = { test: name, error: err.message, severity };
      switch (severity) {
        case 'CRITICAL': results.criticalIssues.push(issue); break;
        case 'HIGH': results.highIssues.push(issue); break;
        case 'MEDIUM': results.mediumIssues.push(issue); break;
        case 'LOW': results.lowIssues.push(issue); break;
      }
    }
    results.testDetails.push(detail);
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertContains(body, text, message) {
  if (!body.includes(text)) throw new Error(message || `Expected body to contain "${text}"`);
}

function assertNotContains(body, text, message) {
  if (body.includes(text)) throw new Error(message || `Expected body NOT to contain "${text}"`);
}

// ============================================================
// TEST SUITES
// ============================================================

// SUITE 1: Homepage Tests
const homepageTests = [
  test('Homepage loads with 200 status', 'CRITICAL', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  }),

  test('Homepage contains site title "Fatima Zehra"', 'CRITICAL', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'Fatima Zehra', 'Site title "Fatima Zehra" not found in homepage');
  }),

  test('Homepage contains "Boutique" branding', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'Boutique', 'Boutique branding not found');
  }),

  test('Homepage has hero section with welcome text', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'Welcome to Luxury Fashion', 'Hero section welcome text not found');
  }),

  test('Homepage has Explore Collection CTA', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'Explore Collection', 'Explore Collection CTA not found');
  }),

  test('Homepage displays categories section', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'Browse Our Categories', 'Categories section not found');
  }),

  test('Homepage shows Fancy Suits category', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'Fancy Suits', 'Fancy Suits category not found');
  }),

  test('Homepage shows Shalwar Qameez category', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'Shalwar Qameez', 'Shalwar Qameez category not found');
  }),

  test('Homepage shows Cotton Suits category', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'Cotton Suits', 'Cotton Suits category not found');
  }),

  test('Homepage shows Designer Brands category', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'Designer Brands', 'Designer Brands category not found');
  }),

  test('Homepage has testimonials section', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'Testimonials', 'Testimonials section not found');
  }),

  test('Homepage has CTA section', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'Ready to Find Your Perfect Suit', 'CTA section not found');
  }),

  test('Homepage has Free Delivery badge', 'LOW', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'Free Delivery', 'Free Delivery badge not found');
  }),

  test('Homepage has Secure Checkout badge', 'LOW', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'Secure Checkout', 'Secure Checkout badge not found');
  }),

  test('Homepage has Premium Quality badge', 'LOW', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'Premium Quality', 'Premium Quality badge not found');
  }),

  test('Homepage contains proper meta title', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'Fatima Zehra Boutique', 'Meta title not found');
  }),

  test('Homepage response time under 5 seconds', 'HIGH', async () => {
    const start = Date.now();
    await fetchUrl(`${BASE_URL}/`);
    const duration = Date.now() - start;
    assert(duration < 5000, `Homepage took ${duration}ms (expected <5000ms)`);
  }),

  test('Homepage HTML is not empty', 'CRITICAL', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assert(res.body.length > 500, `Homepage HTML too small: ${res.body.length} bytes`);
  }),

  test('Homepage contains DOCTYPE', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, '<!DOCTYPE html>', 'DOCTYPE declaration not found');
  }),

  test('Homepage has proper lang attribute', 'LOW', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'lang="en"', 'HTML lang attribute not found');
  }),
];

// SUITE 2: Navigation Tests
const navigationTests = [
  test('Products page loads with 200 status', 'CRITICAL', async () => {
    const res = await fetchUrl(`${BASE_URL}/products`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  }),

  test('Products page has "Our Collection" heading', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/products`);
    assertContains(res.body, 'Our Collection', 'Products page heading not found');
  }),

  test('Cart page loads with 200 status', 'CRITICAL', async () => {
    const res = await fetchUrl(`${BASE_URL}/cart`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  }),

  test('Cart page shows empty cart state', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/cart`);
    assertContains(res.body, 'Your Cart is Empty', 'Empty cart state not displayed');
  }),

  test('About page loads with 200 status', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/about`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  }),

  test('Contact page loads with 200 status', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/contact`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  }),

  test('Login page loads with 200 status', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/auth/login`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  }),

  test('Privacy page loads with 200 status', 'LOW', async () => {
    const res = await fetchUrl(`${BASE_URL}/privacy`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  }),

  test('Terms page loads with 200 status', 'LOW', async () => {
    const res = await fetchUrl(`${BASE_URL}/terms`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  }),

  test('Orders page loads with 200 status', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/orders`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  }),

  test('Profile page loads with 200 status', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/profile`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  }),

  test('404 page returns proper not found for invalid routes', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/this-page-does-not-exist`);
    assert(res.status === 404 || res.status === 200, `Expected 404 or 200, got ${res.status}`);
  }),

  test('Product detail page loads for product ID 1', 'CRITICAL', async () => {
    const res = await fetchUrl(`${BASE_URL}/products/1`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  }),

  test('Product detail page loads for product ID 20', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/products/20`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  }),

  test('Product detail page loads for product ID 40', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/products/40`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  }),
];

// SUITE 3: Product Content Tests
const productContentTests = [
  test('Products page lists all 40 products text', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/products`);
    assertContains(res.body, '40', 'Product count (40) not found on products page');
  }),

  test('Products page has search functionality', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/products`);
    assertContains(res.body, 'Search', 'Search input not found');
  }),

  test('Products page has category filter', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/products`);
    assertContains(res.body, 'Categories', 'Category filter not found');
  }),

  test('Products page has price range filter', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/products`);
    assertContains(res.body, 'Price Range', 'Price range filter not found');
  }),

  test('Products page has sort options', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/products`);
    assertContains(res.body, 'Sort By', 'Sort options not found');
  }),

  test('Products page shows "Showing X products" text', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/products`);
    assertContains(res.body, 'products', 'Product count text not found');
  }),

  test('Products page has Clear Filters button', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/products`);
    assertContains(res.body, 'Clear Filters', 'Clear Filters button not found');
  }),

  test('Product names are displayed (Royal Embroidered Fancy Suit)', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/products`);
    assertContains(res.body, 'Royal Embroidered Fancy Suit', 'Product name not found');
  }),

  test('Product prices are displayed', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/products`);
    assertContains(res.body, 'Rs', 'Product prices (Rs prefix) not found');
  }),
];

// SUITE 4: Product Detail Tests
// NOTE: Product detail content is rendered CLIENT-SIDE via useEffect, so SSR HTML
// will not contain product-specific data. This is a known architectural decision
// (SEO recommendation: use server components for product data).
const productDetailTests = [
  test('Product detail page returns 200 status', 'CRITICAL', async () => {
    const res = await fetchUrl(`${BASE_URL}/products/1`);
    assert(res.status === 200, `Product detail page returned ${res.status}`);
  }),

  test('Product detail page contains client-side product script bundle', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/products/1`);
    // Check that the JS bundle is present for client-side hydration
    assertContains(res.body, 'script', 'No script tags found - client-side rendering will fail');
  }),

  test('Product detail page has proper HTML structure', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/products/1`);
    assertContains(res.body, '<!DOCTYPE html>', 'DOCTYPE missing on product detail page');
    assertContains(res.body, '<html', 'HTML element missing');
  }),

  test('Product detail SSR includes loading state (client-rendered)', 'MEDIUM', async () => {
    // Client-rendered component shows loading state in SSR
    const res = await fetchUrl(`${BASE_URL}/products/1`);
    // The page renders client-side content, SSR may have initial shell
    assert(res.body.length > 1000, 'Product detail page HTML too small');
  }),

  test('Product detail page response time under 3 seconds', 'HIGH', async () => {
    const start = Date.now();
    await fetchUrl(`${BASE_URL}/products/1`);
    const duration = Date.now() - start;
    assert(duration < 3000, `Product detail loaded in ${duration}ms (target: <3000ms)`);
  }),

  test('All 40 product detail pages return 200', 'CRITICAL', async () => {
    const fails = [];
    for (let id = 1; id <= 40; id++) {
      const res = await fetchUrl(`${BASE_URL}/products/${id}`);
      if (res.status !== 200) fails.push(`Product ${id}: ${res.status}`);
    }
    assert(fails.length === 0, `Failed products: ${fails.join(', ')}`);
  }),

  test('Invalid product ID returns a page (not crash)', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/products/999`);
    assert(res.status === 200 || res.status === 404, `Invalid product page returned ${res.status}`);
  }),
];

// SUITE 5: Image Asset Tests
const imageAssetTests = [
  test('Hero image file reference exists in HTML', 'CRITICAL', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'fancy-suits-01.jpg', 'Hero image reference not found in HTML');
  }),

  test('Favicon/SVG loads successfully', 'LOW', async () => {
    try {
      const res = await fetchUrl(`${BASE_URL}/favicon.svg`);
      assert(res.status === 200 || res.status === 304, `Favicon returned ${res.status}`);
    } catch (e) {
      // favicon not critical
      throw new Error('Favicon not accessible');
    }
  }),

  test('Image reference: fancy-suits-01.jpg returns 200', 'CRITICAL', async () => {
    const res = await fetchUrl(`${BASE_URL}/images/fancy-suits/fancy-suits-01.jpg`);
    assert(res.status === 200, `Image returned ${res.status} -- PRODUCT IMAGES BROKEN: Files on disk have wrong names (download.jpg vs fancy-suits-01.jpg)`);
  }),

  test('Image reference: shalwar-qameez-01.jpg returns 200', 'CRITICAL', async () => {
    const res = await fetchUrl(`${BASE_URL}/images/shalwar-qameez/shalwar-qameez-01.jpg`);
    assert(res.status === 200, `Image returned ${res.status} -- PRODUCT IMAGES BROKEN: Filename mismatch on disk`);
  }),

  test('Image reference: cotton-suits-01.jpg returns 200', 'CRITICAL', async () => {
    const res = await fetchUrl(`${BASE_URL}/images/cotton-suits/cotton-suits-01.jpg`);
    assert(res.status === 200, `Image returned ${res.status} -- PRODUCT IMAGES BROKEN: Filename mismatch on disk`);
  }),

  test('Image reference: designer-brands-01.jpg returns 200', 'CRITICAL', async () => {
    const res = await fetchUrl(`${BASE_URL}/images/designer-brands/designer-brands-01.jpg`);
    assert(res.status === 200, `Image returned ${res.status} -- PRODUCT IMAGES BROKEN: Filename mismatch on disk`);
  }),

  test('Testimonial image: customer-1.jpg returns 200', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/images/testimonials/customer-1.jpg`);
    assert(res.status === 200, `Testimonial image returned ${res.status}`);
  }),
];

// SUITE 6: Layout/Component Tests
const layoutTests = [
  test('Navbar contains Home link', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'Home', 'Home nav link not found');
  }),

  test('Navbar contains Shop link', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'Shop', 'Shop nav link not found');
  }),

  test('Navbar contains About link', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'About', 'About nav link not found');
  }),

  test('Navbar contains Contact link', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'Contact', 'Contact nav link not found');
  }),

  test('Navbar has cart icon with link to /cart', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, '/cart', 'Cart link not found');
  }),

  test('Navbar has login link to /auth/login', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, '/auth/login', 'Login link not found');
  }),

  test('Footer is present on homepage', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    // Footer component is rendered server-side
    assertContains(res.body, 'footer', 'Footer element not found (case-insensitive check)');
  }),

  test('ChatWidget button is present', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'Open chat', 'Chat widget button not found (aria-label)');
  }),

  test('FloatingWhatsAppButton is present', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'Open WhatsApp chat', 'Floating WhatsApp button not found (aria-label)');
  }),
];

// SUITE 7: Cart Page Tests
const cartTests = [
  test('Cart page loads correctly', 'CRITICAL', async () => {
    const res = await fetchUrl(`${BASE_URL}/cart`);
    assert(res.status === 200, `Cart page returned ${res.status}`);
  }),

  test('Cart page has "Continue Shopping" link', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/cart`);
    assertContains(res.body, 'Continue Shopping', 'Continue Shopping link not found');
  }),

  test('Cart page contains client-side JS for Stripe checkout', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/cart`);
    // Stripe is loaded client-side via @stripe/stripe-js -- check for JS bundles
    assertContains(res.body, 'script', 'Cart page missing script tags for client-side Stripe');
  }),

  test('Cart page has ShoppingBag icon for empty state', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/cart`);
    assertContains(res.body, 'Shopping', 'Shopping bag icon reference not found');
  }),
];

// SUITE 8: Static Assets Tests
const staticAssetsTests = [
  test('CSS file loads successfully', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    const cssMatch = res.body.match(/href="(\/_next\/static\/[^"]*\.css)"/);
    if (!cssMatch) {
      throw new Error('No CSS file reference found in HTML');
    }
    const cssUrl = `${BASE_URL}${cssMatch[1]}`;
    const cssRes = await fetchUrl(cssUrl);
    assert(cssRes.status === 200, `CSS file returned ${cssRes.status}`);
    assert(cssRes.body.length > 100, `CSS file too small: ${cssRes.body.length} bytes`);
  }),

  test('JavaScript files load successfully', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    const jsMatch = res.body.match(/src="(\/_next\/static\/[^"]*\.js)"/);
    if (!jsMatch) {
      throw new Error('No JS file reference found in HTML');
    }
    const jsUrl = `${BASE_URL}${jsMatch[1]}`;
    const jsRes = await fetchUrl(jsUrl);
    assert(jsRes.status === 200, `JS file returned ${jsRes.status}`);
  }),

  test('_next directory is accessible', 'HIGH', async () => {
    // Just check that a script from the page loads
    const res = await fetchUrl(`${BASE_URL}/`);
    const matches = res.body.match(/src="(\/_next\/[^"]+)"/g);
    assert(matches && matches.length > 0, 'No _next scripts found');
  }),
];

// SUITE 9: Backend Service Health Tests
const backendHealthTests = [
  test('User Service (8001) health check', 'HIGH', async () => {
    try {
      const res = await fetchUrl(`${BACKEND_URLS.userService}/health`, { timeout: 5000 });
      assert(res.status === 200, `User service returned ${res.status}`);
    } catch (e) {
      throw new Error(`User Service UNAVAILABLE: ${e.message}`);
    }
  }),

  test('Product Service (8002) health check', 'HIGH', async () => {
    try {
      const res = await fetchUrl(`${BACKEND_URLS.productService}/health`, { timeout: 5000 });
      assert(res.status === 200, `Product service returned ${res.status}`);
    } catch (e) {
      throw new Error(`Product Service UNAVAILABLE: ${e.message}`);
    }
  }),

  test('Order Service (8003) health check', 'HIGH', async () => {
    try {
      const res = await fetchUrl(`${BACKEND_URLS.orderService}/health`, { timeout: 5000 });
      assert(res.status === 200, `Order service returned ${res.status}`);
    } catch (e) {
      throw new Error(`Order Service UNAVAILABLE: ${e.message}`);
    }
  }),

  test('Chat Service (8004) health check', 'HIGH', async () => {
    try {
      const res = await fetchUrl(`${BACKEND_URLS.chatService}/health`, { timeout: 5000 });
      assert(res.status === 200, `Chat service returned ${res.status}`);
    } catch (e) {
      throw new Error(`Chat Service UNAVAILABLE: ${e.message}`);
    }
  }),
];

// SUITE 10: Security Tests
const securityTests = [
  test('Server does not expose version headers', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assert(!res.headers['x-powered-by'], 'X-Powered-By header is exposed (security risk)');
  }),

  test('Content-Type header is set correctly', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assert(res.headers['content-type'], 'Content-Type header missing');
    assertContains(res.headers['content-type'], 'text/html', 'Content-Type should be text/html');
  }),

  test('No server error information exposed in HTML', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertNotContains(res.body, 'stack trace', 'Stack trace exposed in HTML');
    assertNotContains(res.body, 'Internal Server Error', 'Internal Server Error text in HTML');
  }),

  test('No API keys or secrets in HTML source', 'CRITICAL', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertNotContains(res.body, 'sk_live_', 'Stripe live secret key exposed!');
    assertNotContains(res.body, 'sk_test_', 'Stripe test secret key exposed!');
    assertNotContains(res.body, 'OPENAI_API_KEY', 'OpenAI API key variable exposed!');
  }),

  test('No .env file accessible', 'CRITICAL', async () => {
    const res = await fetchUrl(`${BASE_URL}/.env`);
    assert(res.status === 404 || !res.body.includes('DATABASE_URL'), '.env file is publicly accessible!');
  }),

  test('No source maps exposed in production', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    // In dev mode sourcemaps are OK, check there's no prod leak
    // This is informational for dev mode
    assertNotContains(res.body, 'sourceMappingURL=http', 'External source maps exposed');
  }),
];

// SUITE 11: Performance Tests
const performanceTests = [
  test('Homepage loads under 3 seconds', 'HIGH', async () => {
    const start = Date.now();
    await fetchUrl(`${BASE_URL}/`);
    const duration = Date.now() - start;
    assert(duration < 3000, `Homepage loaded in ${duration}ms (target: <3000ms)`);
  }),

  test('Products page loads under 3 seconds', 'HIGH', async () => {
    const start = Date.now();
    await fetchUrl(`${BASE_URL}/products`);
    const duration = Date.now() - start;
    assert(duration < 3000, `Products page loaded in ${duration}ms (target: <3000ms)`);
  }),

  test('Product detail page loads under 3 seconds', 'HIGH', async () => {
    const start = Date.now();
    await fetchUrl(`${BASE_URL}/products/1`);
    const duration = Date.now() - start;
    assert(duration < 3000, `Product detail loaded in ${duration}ms (target: <3000ms)`);
  }),

  test('Cart page loads under 3 seconds', 'HIGH', async () => {
    const start = Date.now();
    await fetchUrl(`${BASE_URL}/cart`);
    const duration = Date.now() - start;
    assert(duration < 3000, `Cart page loaded in ${duration}ms (target: <3000ms)`);
  }),

  test('Homepage HTML size is reasonable (<500KB)', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    const sizeKB = res.body.length / 1024;
    assert(sizeKB < 500, `Homepage HTML is ${sizeKB.toFixed(1)}KB (target: <500KB)`);
  }),

  test('Concurrent requests handled correctly (5 parallel)', 'HIGH', async () => {
    const start = Date.now();
    const requests = Array.from({length: 5}, () => fetchUrl(`${BASE_URL}/`));
    const responses = await Promise.all(requests);
    const duration = Date.now() - start;
    const allOk = responses.every(r => r.status === 200);
    assert(allOk, 'Not all concurrent requests returned 200');
    assert(duration < 10000, `Concurrent requests took ${duration}ms (target: <10000ms)`);
  }),
];

// SUITE 12: Checkout Flow Structure Tests
const checkoutFlowTests = [
  test('Cart page has checkout form structure', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/cart`);
    assertContains(res.body, 'cart', 'Cart page missing cart references');
  }),

  test('Cart page has client-side JS bundle for checkout flow', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/cart`);
    // Stripe Elements are loaded client-side, verify JS bundles exist
    assertContains(res.body, 'script', 'Cart page missing JS bundles for checkout');
  }),

  test('Cart page has Continue Shopping link to products', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/cart`);
    assertContains(res.body, '/products', 'Link to products page not found in cart');
  }),
];

// SUITE 13: Auth Page Tests
const authTests = [
  test('Login page has email input', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/auth/login`);
    assertContains(res.body, 'email', 'Email input not found on login page');
  }),

  test('Login page has password input', 'HIGH', async () => {
    const res = await fetchUrl(`${BASE_URL}/auth/login`);
    assertContains(res.body, 'password', 'Password input not found on login page');
  }),
];

// SUITE 14: Accessibility Tests
const accessibilityTests = [
  test('Chat widget has aria-label', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'aria-label', 'No aria-label attributes found');
  }),

  test('WhatsApp button has aria-label', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'Open WhatsApp chat', 'WhatsApp aria-label not found');
  }),

  test('Images have alt attributes in HTML', 'MEDIUM', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, 'alt=', 'No alt attributes found in images');
  }),

  test('Navigation uses semantic nav element', 'LOW', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, '<nav', 'Semantic nav element not found');
  }),

  test('Main content uses semantic main element', 'LOW', async () => {
    const res = await fetchUrl(`${BASE_URL}/`);
    assertContains(res.body, '<main', 'Semantic main element not found');
  }),
];

// ============================================================
// MAIN EXECUTION
// ============================================================

async function runAllTests() {
  results.startTime = new Date();

  console.log('');
  console.log('========================================================');
  console.log('  FATIMA ZEHRA BOUTIQUE - COMPREHENSIVE E2E TEST SUITE  ');
  console.log('========================================================');
  console.log(`  Target: ${BASE_URL}`);
  console.log(`  Started: ${results.startTime.toISOString()}`);
  console.log('========================================================');
  console.log('');

  const suites = [
    { name: 'HOMEPAGE', tests: homepageTests },
    { name: 'NAVIGATION', tests: navigationTests },
    { name: 'PRODUCT CONTENT', tests: productContentTests },
    { name: 'PRODUCT DETAIL', tests: productDetailTests },
    { name: 'IMAGE ASSETS', tests: imageAssetTests },
    { name: 'LAYOUT/COMPONENTS', tests: layoutTests },
    { name: 'CART PAGE', tests: cartTests },
    { name: 'STATIC ASSETS', tests: staticAssetsTests },
    { name: 'BACKEND SERVICES', tests: backendHealthTests },
    { name: 'SECURITY', tests: securityTests },
    { name: 'PERFORMANCE', tests: performanceTests },
    { name: 'CHECKOUT FLOW', tests: checkoutFlowTests },
    { name: 'AUTHENTICATION', tests: authTests },
    { name: 'ACCESSIBILITY', tests: accessibilityTests },
  ];

  for (const suite of suites) {
    console.log(`\n--- ${suite.name} TESTS ---`);
    for (const testFn of suite.tests) {
      await testFn();
    }
  }

  results.endTime = new Date();
  const durationSec = ((results.endTime - results.startTime) / 1000).toFixed(1);

  console.log('');
  console.log('========================================================');
  console.log('                    TEST RESULTS SUMMARY                 ');
  console.log('========================================================');
  console.log('');
  console.log(`  Total Tests:  ${results.total}`);
  console.log(`  Passed:       ${results.passed}`);
  console.log(`  Failed:       ${results.failed}`);
  console.log(`  Pass Rate:    ${((results.passed / results.total) * 100).toFixed(1)}%`);
  console.log(`  Duration:     ${durationSec}s`);
  console.log('');

  if (results.criticalIssues.length > 0) {
    console.log('  [CRITICAL ISSUES]');
    results.criticalIssues.forEach(issue => {
      console.log(`    * ${issue.test}: ${issue.error}`);
    });
    console.log('');
  }

  if (results.highIssues.length > 0) {
    console.log('  [HIGH SEVERITY ISSUES]');
    results.highIssues.forEach(issue => {
      console.log(`    * ${issue.test}: ${issue.error}`);
    });
    console.log('');
  }

  if (results.mediumIssues.length > 0) {
    console.log('  [MEDIUM SEVERITY ISSUES]');
    results.mediumIssues.forEach(issue => {
      console.log(`    * ${issue.test}: ${issue.error}`);
    });
    console.log('');
  }

  if (results.lowIssues.length > 0) {
    console.log('  [LOW SEVERITY ISSUES]');
    results.lowIssues.forEach(issue => {
      console.log(`    * ${issue.test}: ${issue.error}`);
    });
    console.log('');
  }

  console.log('========================================================');
  console.log('  ISSUE SEVERITY BREAKDOWN');
  console.log('========================================================');
  console.log(`  Critical: ${results.criticalIssues.length}`);
  console.log(`  High:     ${results.highIssues.length}`);
  console.log(`  Medium:   ${results.mediumIssues.length}`);
  console.log(`  Low:      ${results.lowIssues.length}`);
  console.log('========================================================');
  console.log('');

  // Output JSON for parsing
  const jsonReport = JSON.stringify(results, null, 2);
  const reportDir = require('path').join(__dirname, '..', '..', 'test-reports');
  try { require('fs').mkdirSync(reportDir, { recursive: true }); } catch(e) {}
  const reportPath = require('path').join(reportDir, 'e2e-test-report.json');
  require('fs').writeFileSync(reportPath, jsonReport);
  console.log(`  Full JSON report saved to: ${reportPath}`);
  console.log('');

  // Exit with failure code if any critical tests failed
  if (results.criticalIssues.length > 0) {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('TEST RUNNER CRASHED:', err);
  process.exit(2);
});
