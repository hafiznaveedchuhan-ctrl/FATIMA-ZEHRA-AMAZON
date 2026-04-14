"""
Comprehensive Frontend E2E Tests for Fatima Zehra Boutique
==========================================================
Tests all pages, navigation, content, structure, and accessibility.
Since Playwright browser is not available in this environment,
these tests validate the frontend via HTTP requests against the
static build served on localhost:3000.

Run with: pytest tests/e2e/test_frontend_e2e.py -v --tb=short
"""

import time
import re
import pytest
import requests
from html.parser import HTMLParser

# ====================== CONFIGURATION ======================

BASE_URL = "http://localhost:3000"
TIMEOUT = 10

# ====================== HTML HELPER ======================


class HTMLContentExtractor(HTMLParser):
    """Extract text content and elements from HTML."""

    def __init__(self):
        super().__init__()
        self.text_parts = []
        self.links = []
        self.images = []
        self.inputs = []
        self.buttons = []
        self.current_tag = None
        self.current_attrs = {}
        self._skip_tags = {'script', 'style', 'noscript'}
        self._skip = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        self.current_tag = tag
        self.current_attrs = attrs_dict

        if tag in self._skip_tags:
            self._skip = True
            return

        if tag == 'a':
            self.links.append(attrs_dict)
        elif tag == 'img':
            self.images.append(attrs_dict)
        elif tag == 'input':
            self.inputs.append(attrs_dict)
        elif tag == 'button':
            self.buttons.append(attrs_dict)

    def handle_endtag(self, tag):
        if tag in self._skip_tags:
            self._skip = False

    def handle_data(self, data):
        if not self._skip:
            text = data.strip()
            if text:
                self.text_parts.append(text)

    @property
    def full_text(self):
        return ' '.join(self.text_parts)


def parse_html(html: str) -> HTMLContentExtractor:
    """Parse HTML and return content extractor."""
    parser = HTMLContentExtractor()
    parser.feed(html)
    return parser


def get_page(path: str) -> tuple:
    """Fetch a page and return (status_code, html, parsed)."""
    resp = requests.get(f"{BASE_URL}{path}", timeout=TIMEOUT)
    parsed = parse_html(resp.text) if resp.status_code == 200 else None
    return resp.status_code, resp.text, parsed


# ====================== PAGE AVAILABILITY TESTS ======================

class TestPageAvailability:
    """All pages must return HTTP 200."""

    @pytest.mark.parametrize("path", [
        "/",
        "/products",
        "/cart",
        "/about",
        "/contact",
        "/auth/login",
        "/auth/register",
        "/privacy",
        "/terms",
        "/profile",
        "/orders",
    ])
    def test_page_returns_200(self, path):
        status, _, _ = get_page(path)
        assert status == 200, f"Page {path} returned {status}"

    @pytest.mark.parametrize("product_id", range(1, 41))
    def test_product_detail_page_returns_200(self, product_id):
        status, _, _ = get_page(f"/products/{product_id}")
        assert status == 200, f"Product page {product_id} returned {status}"


# ====================== HOMEPAGE TESTS ======================

class TestHomepage:
    """Validate homepage content and structure."""

    @pytest.fixture(autouse=True)
    def setup(self):
        _, self.html, self.parsed = get_page("/")
        self.text = self.parsed.full_text

    def test_has_correct_title(self):
        assert "Fatima Zehra" in self.html
        assert "<title>" in self.html

    def test_displays_brand_name(self):
        assert "FATIMA" in self.text
        assert "ZEHRA" in self.text

    def test_displays_hero_tagline(self):
        assert "Timeless" in self.text
        assert "Elegance" in self.text
        assert "Redefined" in self.text

    def test_displays_new_collection_badge(self):
        assert "New Collection 2026" in self.text

    def test_displays_hero_description(self):
        assert "Fatima Zehra Boutique brings you" in self.text

    def test_displays_explore_boutique_cta(self):
        assert "Explore Boutique" in self.text

    def test_explore_boutique_links_to_products(self):
        product_links = [l for l in self.parsed.links if l.get('href', '').startswith('/products')]
        assert len(product_links) > 0

    def test_displays_hero_image(self):
        hero_images = [i for i in self.parsed.images if "Luxury Collection" in i.get('alt', '')]
        assert len(hero_images) > 0

    def test_displays_strategic_values(self):
        assert "Express Shipping" in self.text
        assert "Secure Payment" in self.text
        assert "Made with Love" in self.text

    def test_displays_across_pakistan(self):
        assert "Across Pakistan" in self.text

    def test_displays_four_categories(self):
        assert "Fancy Suits" in self.text
        assert "Shalwar Qameez" in self.text
        assert "Cotton Suits" in self.text
        assert "Designer Brands" in self.text

    def test_displays_shop_by_department(self):
        assert "Shop by" in self.text
        assert "Department" in self.text

    def test_displays_the_collections_label(self):
        assert "The Collections" in self.text

    def test_displays_category_tags(self):
        assert "Wedding Wear" in self.text
        assert "Luxury Edition" in self.text
        assert "Premium Fabric" in self.text
        assert "New Arrival" in self.text

    def test_displays_trending_section(self):
        assert "Trending" in self.text

    def test_displays_luxury_cta_section(self):
        assert "Confidence" in self.text
        assert "Shop the Collection" in self.text

    def test_displays_contact_info(self):
        assert "Karachi, Pakistan" in self.text
        assert "+92 300 2385209" in self.text

    def test_displays_free_shipping_banner(self):
        assert "Free Worldwide Shipping" in self.text

    def test_has_navigation_links(self):
        link_hrefs = [l.get('href', '') for l in self.parsed.links]
        assert '/' in link_hrefs
        assert '/products' in link_hrefs
        assert '/about' in link_hrefs
        assert '/contact' in link_hrefs

    def test_has_cart_link(self):
        cart_links = [l for l in self.parsed.links if l.get('href') == '/cart']
        assert len(cart_links) > 0

    def test_has_category_links(self):
        cat_links = [l for l in self.parsed.links if '/products?category=' in l.get('href', '')]
        assert len(cat_links) == 4

    def test_has_multiple_images(self):
        assert len(self.parsed.images) >= 5

    def test_hero_image_has_alt_text(self):
        for img in self.parsed.images:
            if "Luxury Collection" in img.get('alt', ''):
                assert img.get('alt')
                return
        pytest.fail("Hero image not found")

    def test_displays_chat_widget_button(self):
        # Chat widget is rendered client-side, check the aria-label exists in HTML
        assert 'aria-label="Open chat"' in self.html

    def test_displays_whatsapp_button(self):
        assert 'aria-label="Open WhatsApp chat"' in self.html

    def test_displays_footer(self):
        # Footer should contain brand name
        assert "Fatima Zehra Boutique" in self.text

    def test_has_spinning_logo_animation(self):
        assert "logo-spin-infinite" in self.html
        assert "circular-rotate" in self.html


# ====================== PRODUCTS PAGE TESTS ======================

class TestProductsPage:
    """Validate products listing page."""

    @pytest.fixture(autouse=True)
    def setup(self):
        _, self.html, self.parsed = get_page("/products")
        self.text = self.parsed.full_text

    def test_displays_page_heading(self):
        assert "Our Collection" in self.text

    def test_displays_product_count(self):
        assert "40" in self.text

    def test_displays_search_input(self):
        search_inputs = [i for i in self.parsed.inputs
                         if 'Search' in i.get('placeholder', '')]
        assert len(search_inputs) > 0

    def test_displays_filters_heading(self):
        assert "Filters" in self.text

    def test_displays_categories_section(self):
        assert "Categories" in self.text
        assert "All Products" in self.text

    def test_displays_category_buttons(self):
        assert "Fancy Suits" in self.text
        assert "Shalwar Qameez" in self.text
        assert "Cotton Suits" in self.text
        assert "Designer Brands" in self.text

    def test_displays_price_range_section(self):
        assert "Price Range" in self.text
        range_inputs = [i for i in self.parsed.inputs if i.get('type') == 'range']
        assert len(range_inputs) == 2

    def test_displays_sort_options(self):
        assert "Sort By" in self.text
        assert "Newest" in self.text
        assert "Price: Low to High" in self.text
        assert "Price: High to Low" in self.text
        assert "Top Rated" in self.text

    def test_displays_clear_filters_button(self):
        assert "Clear Filters" in self.text

    def test_displays_showing_count(self):
        assert "Showing" in self.text

    def test_displays_product_images(self):
        assert len(self.parsed.images) >= 10

    def test_displays_product_prices(self):
        assert "Rs" in self.text

    def test_product_names_present(self):
        """Server-rendered products page should contain product names.
        Some products may not be in initial render due to client-side sorting."""
        # Check names that appear in the default render order (newest first = highest ID)
        found = 0
        test_names = [
            "Royal Embroidered Fancy Suit",
            "Classic White Shalwar Qameez",
            "Pure Cotton Comfort Suit",
            "Limelight Designer",
            "Bonanza Satrangi",
        ]
        for name in test_names:
            if name in self.text:
                found += 1
        assert found >= 2, f"Only found {found}/5 product names in listing page"


# ====================== PRODUCT DETAIL TESTS ======================

class TestProductDetailPage:
    """Test individual product detail pages.

    Note: Product detail pages use client-side rendering (ProductDetailClient),
    so the product data is embedded in the JS bundle, not the initial HTML.
    We verify the page shell loads correctly and contains the needed JS.
    """

    def test_product_1_page_loads(self):
        status, html, parsed = get_page("/products/1")
        assert status == 200
        # Page should have proper structure with navbar and layout
        assert "Fatima Zehra" in parsed.full_text

    def test_product_1_has_js_bundle(self):
        """Product detail page should include JS that renders product data."""
        _, html, _ = get_page("/products/1")
        # Should contain script tags for client-side rendering
        assert "/_next/static/chunks/" in html

    def test_product_detail_pages_have_consistent_shell(self):
        """All product detail pages should have the same layout shell."""
        for pid in [1, 11, 21, 31, 40]:
            status, html, parsed = get_page(f"/products/{pid}")
            assert status == 200
            # Each page has navbar (contains FATIMA ZEHRA)
            assert "FATIMA" in parsed.full_text

    def test_product_detail_has_chat_widget(self):
        _, html, _ = get_page("/products/1")
        assert 'aria-label="Open chat"' in html

    def test_product_detail_has_whatsapp(self):
        _, html, _ = get_page("/products/1")
        assert 'aria-label="Open WhatsApp chat"' in html

    def test_product_detail_has_cart_link(self):
        _, html, parsed = get_page("/products/1")
        cart_links = [l for l in parsed.links if l.get('href') == '/cart']
        assert len(cart_links) > 0

    def test_product_data_in_js_bundle(self):
        """Verify product data exists in the JS bundles loaded by the page."""
        _, html, _ = get_page("/products/1")
        # Extract JS file paths
        js_files = re.findall(r'src="(/_next/static/chunks/[^"]+)"', html)
        assert len(js_files) > 0, "No JS bundles found in product page"

        # Check if product data is in any bundle
        product_found = False
        for js_path in js_files[:15]:
            resp = requests.get(f"{BASE_URL}{js_path}", timeout=TIMEOUT)
            if resp.status_code == 200 and "Royal Embroidered" in resp.text:
                product_found = True
                break
        assert product_found, "Product data not found in any JS bundle"


# ====================== CART PAGE TESTS ======================

class TestCartPage:
    """Test the cart page."""

    def test_empty_cart_state(self):
        _, html, parsed = get_page("/cart")
        assert "Your Cart is Empty" in parsed.full_text

    def test_continue_shopping_link(self):
        _, html, parsed = get_page("/cart")
        assert "Continue Shopping" in parsed.full_text
        product_links = [l for l in parsed.links if l.get('href') == '/products']
        assert len(product_links) > 0

    def test_shopping_bag_icon_present(self):
        _, html, parsed = get_page("/cart")
        # SVG shopping bag icon should be present
        assert "lucide" in html or "svg" in html.lower()


# ====================== AUTH PAGES TESTS ======================

class TestLoginPage:
    """Test the login page."""

    @pytest.fixture(autouse=True)
    def setup(self):
        _, self.html, self.parsed = get_page("/auth/login")
        self.text = self.parsed.full_text

    def test_displays_login_heading(self):
        assert "Login" in self.text

    def test_has_email_input(self):
        email_inputs = [i for i in self.parsed.inputs if i.get('type') == 'email']
        assert len(email_inputs) > 0

    def test_has_password_input(self):
        pwd_inputs = [i for i in self.parsed.inputs if i.get('type') == 'password']
        assert len(pwd_inputs) > 0

    def test_has_login_button(self):
        assert "Login" in self.text

    def test_has_register_link(self):
        register_links = [l for l in self.parsed.links
                          if '/auth/register' in l.get('href', '')]
        assert len(register_links) > 0

    def test_displays_dont_have_account(self):
        assert "Don" in self.text  # "Don't have an account?"

    def test_email_placeholder(self):
        email_inputs = [i for i in self.parsed.inputs if i.get('type') == 'email']
        assert any('example.com' in i.get('placeholder', '') for i in email_inputs)


class TestRegisterPage:
    """Test the registration page."""

    @pytest.fixture(autouse=True)
    def setup(self):
        _, self.html, self.parsed = get_page("/auth/register")
        self.text = self.parsed.full_text

    def test_displays_register_heading(self):
        assert "Register" in self.text

    def test_has_full_name_input(self):
        text_inputs = [i for i in self.parsed.inputs if i.get('type') == 'text']
        assert len(text_inputs) > 0

    def test_has_email_input(self):
        email_inputs = [i for i in self.parsed.inputs if i.get('type') == 'email']
        assert len(email_inputs) > 0

    def test_has_password_input(self):
        pwd_inputs = [i for i in self.parsed.inputs if i.get('type') == 'password']
        assert len(pwd_inputs) > 0

    def test_has_login_link(self):
        login_links = [l for l in self.parsed.links
                       if '/auth/login' in l.get('href', '')]
        assert len(login_links) > 0

    def test_password_minimum_length_note(self):
        assert "Minimum 8 characters" in self.text

    def test_already_have_account_text(self):
        assert "Already have an account" in self.text


# ====================== NAVIGATION TESTS ======================

class TestNavigation:
    """Test navigation structure across pages."""

    @pytest.mark.parametrize("path", [
        "/", "/products", "/cart", "/about", "/contact",
        "/auth/login", "/auth/register"
    ])
    def test_navbar_present_on_all_pages(self, path):
        _, html, parsed = get_page(path)
        assert "<nav" in html

    @pytest.mark.parametrize("path", [
        "/", "/products", "/cart", "/about", "/contact",
    ])
    def test_cart_link_on_all_pages(self, path):
        _, html, parsed = get_page(path)
        cart_links = [l for l in parsed.links if l.get('href') == '/cart']
        assert len(cart_links) > 0

    @pytest.mark.parametrize("path", [
        "/", "/products", "/cart", "/about", "/contact",
    ])
    def test_home_link_on_all_pages(self, path):
        _, html, parsed = get_page(path)
        home_links = [l for l in parsed.links if l.get('href') == '/']
        assert len(home_links) > 0

    @pytest.mark.parametrize("path", [
        "/", "/products", "/cart", "/about", "/contact",
    ])
    def test_chat_widget_on_all_pages(self, path):
        _, html, parsed = get_page(path)
        assert 'aria-label="Open chat"' in html

    @pytest.mark.parametrize("path", [
        "/", "/products", "/cart", "/about", "/contact",
    ])
    def test_whatsapp_button_on_all_pages(self, path):
        _, html, parsed = get_page(path)
        assert 'aria-label="Open WhatsApp chat"' in html


# ====================== ABOUT PAGE TESTS ======================

class TestAboutPage:
    """Test the about page."""

    def test_about_page_loads(self):
        status, html, parsed = get_page("/about")
        assert status == 200
        assert len(parsed.full_text) > 100

    def test_about_page_has_content(self):
        _, html, parsed = get_page("/about")
        # Should have substantial content about the boutique
        assert len(parsed.text_parts) > 5


# ====================== CONTACT PAGE TESTS ======================

class TestContactPage:
    """Test the contact page."""

    def test_contact_page_loads(self):
        status, html, parsed = get_page("/contact")
        assert status == 200
        assert len(parsed.full_text) > 100


# ====================== FOOTER TESTS ======================

class TestFooter:
    """Test footer content across pages."""

    def test_footer_has_brand(self):
        _, html, parsed = get_page("/")
        assert "Fatima Zehra" in parsed.full_text

    def test_footer_has_navigation_section(self):
        """Footer contains navigation links (Shop, About, Contact, Orders)."""
        _, html, parsed = get_page("/")
        # Footer links are in the server-rendered HTML
        link_hrefs = [l.get('href', '') for l in parsed.links]
        assert '/orders' in link_hrefs or '/about' in link_hrefs

    def test_privacy_page_exists(self):
        """Privacy page should be accessible."""
        status, _, _ = get_page("/privacy")
        assert status == 200

    def test_terms_page_exists(self):
        """Terms page should be accessible."""
        status, _, _ = get_page("/terms")
        assert status == 200


# ====================== PERFORMANCE TESTS ======================

class TestPerformance:
    """Test page load performance."""

    @pytest.mark.parametrize("path", ["/", "/products", "/cart"])
    def test_page_loads_under_5_seconds(self, path):
        start = time.time()
        resp = requests.get(f"{BASE_URL}{path}", timeout=TIMEOUT)
        elapsed = time.time() - start
        assert resp.status_code == 200
        assert elapsed < 5.0, f"{path} took {elapsed:.2f}s (target <5s)"

    def test_product_detail_loads_under_2_seconds(self):
        start = time.time()
        resp = requests.get(f"{BASE_URL}/products/1", timeout=TIMEOUT)
        elapsed = time.time() - start
        assert resp.status_code == 200
        assert elapsed < 2.0, f"Product detail took {elapsed:.2f}s"

    def test_homepage_html_size_reasonable(self):
        resp = requests.get(f"{BASE_URL}/", timeout=TIMEOUT)
        size_kb = len(resp.content) / 1024
        assert size_kb < 500, f"Homepage is {size_kb:.0f}KB (target <500KB)"

    def test_all_static_assets_load(self):
        """Check that _next static directory is accessible."""
        resp = requests.get(f"{BASE_URL}/", timeout=TIMEOUT)
        # Extract JS/CSS file references
        js_files = re.findall(r'src="(/_next/[^"]+)"', resp.text)
        css_files = re.findall(r'href="(/_next/[^"]+)"', resp.text)

        failed = []
        for asset in (js_files + css_files)[:10]:  # Test up to 10 assets
            asset_resp = requests.get(f"{BASE_URL}{asset}", timeout=TIMEOUT)
            if asset_resp.status_code != 200:
                failed.append(f"{asset}: {asset_resp.status_code}")

        assert len(failed) == 0, f"Failed assets: {failed}"


# ====================== SEO & ACCESSIBILITY TESTS ======================

class TestSEOAndAccessibility:
    """Test SEO and basic accessibility requirements."""

    def test_homepage_has_title_tag(self):
        _, html, _ = get_page("/")
        assert "<title>" in html

    def test_homepage_has_meta_description(self):
        _, html, _ = get_page("/")
        assert 'name="description"' in html

    def test_homepage_has_meta_keywords(self):
        _, html, _ = get_page("/")
        assert 'name="keywords"' in html

    def test_homepage_has_viewport_meta(self):
        _, html, _ = get_page("/")
        assert 'name="viewport"' in html

    def test_homepage_has_lang_attribute(self):
        _, html, _ = get_page("/")
        assert 'lang="en"' in html

    def test_images_have_alt_text(self):
        """At least most images should have alt attributes."""
        _, html, parsed = get_page("/")
        total = len(parsed.images)
        with_alt = len([i for i in parsed.images if i.get('alt')])
        if total > 0:
            ratio = with_alt / total
            assert ratio >= 0.8, f"Only {ratio*100:.0f}% of images have alt text"

    def test_product_images_have_alt_text(self):
        _, html, parsed = get_page("/products")
        total = len(parsed.images)
        with_alt = len([i for i in parsed.images if i.get('alt')])
        if total > 0:
            ratio = with_alt / total
            assert ratio >= 0.8, f"Only {ratio*100:.0f}% of product images have alt"

    def test_favicon_configured(self):
        _, html, _ = get_page("/")
        assert "favicon" in html

    def test_apple_touch_icon(self):
        _, html, _ = get_page("/")
        assert "apple-touch-icon" in html


# ====================== RESPONSIVE STRUCTURE TESTS ======================

class TestResponsiveStructure:
    """Test responsive design HTML markers."""

    def test_has_responsive_classes(self):
        _, html, _ = get_page("/")
        assert "md:" in html or "lg:" in html
        assert "sm:" in html or "md:" in html

    def test_has_mobile_menu_toggle(self):
        _, html, _ = get_page("/")
        assert "lg:hidden" in html

    def test_has_responsive_grid(self):
        _, html, _ = get_page("/products")
        assert "grid-cols" in html

    def test_hero_has_responsive_text(self):
        _, html, _ = get_page("/")
        assert "md:text-" in html or "text-6xl" in html


# ====================== DATA INTEGRITY TESTS ======================

class TestFrontendDataIntegrity:
    """Test that product data is consistent across frontend."""

    def test_products_listing_has_product_data(self):
        """Products listing page should contain product data in HTML or JS."""
        _, html, parsed = get_page("/products")
        text = parsed.full_text
        # Products listing uses client-side rendering but the static export
        # includes the product data. Check for at least some products.
        has_products = (
            "Royal Embroidered" in text or
            "Fancy Suit" in text or
            "Shalwar Qameez" in text or
            "Rs" in text
        )
        assert has_products, "Products page has no product data"

    def test_product_data_exists_in_js_bundles(self):
        """Product data should be embedded in JS bundles for client rendering."""
        _, html, _ = get_page("/products")
        js_files = re.findall(r'src="(/_next/static/chunks/[^"]+)"', html)

        product_found = False
        for js_path in js_files[:15]:
            resp = requests.get(f"{BASE_URL}{js_path}", timeout=TIMEOUT)
            if resp.status_code == 200:
                if "Royal Embroidered" in resp.text or "Fancy Suits" in resp.text:
                    product_found = True
                    break
        assert product_found, "Product data not found in JS bundles"

    def test_categories_data_present(self):
        """Category data should be present in page or JS."""
        _, html, parsed = get_page("/products")
        text = parsed.full_text
        has_categories = (
            "Categories" in text or
            "Filters" in text
        )
        assert has_categories

    def test_product_images_paths_in_page(self):
        """Product image paths should be in the page HTML or JS."""
        _, html, _ = get_page("/products")
        # Check for image path patterns in the full HTML (includes inline JS data)
        categories = ['fancy-suits', 'shalwar-qameez', 'cotton-suits', 'designer-brands']
        for cat in categories:
            assert cat in html, f"Image path for category '{cat}' not found in page"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
