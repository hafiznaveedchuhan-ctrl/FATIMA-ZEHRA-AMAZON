"use client";

import { useState, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS, CATEGORIES } from "@/lib/products";
import { Search, Filter } from "lucide-react";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<"price-low" | "price-high" | "newest" | "rating">("newest");

  const filteredProducts = useMemo(() => {
    let filtered = PRODUCTS;

    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.material.toLowerCase().includes(query)
      );
    }

    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
      default:
        filtered.sort((a, b) => b.id - a.id);
    }

    return filtered;
  }, [selectedCategory, searchQuery, priceRange, sortBy]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <section className="gradient-bg-hero dark:gradient-bg-hero-dark py-12 md:py-16">
        <div className="container-wide">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Shop Everything
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
            Discover {PRODUCTS.length}+ products across all categories at the best prices on Fatima Zehra Amazon Shop.
          </p>
        </div>
      </section>

      <div className="container-wide py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="glass-card rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Filter size={20} />
                Filters
              </h2>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-all ${
                      selectedCategory === "All"
                        ? "bg-orange-600 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    All Products ({PRODUCTS.length})
                  </button>
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-all ${
                        selectedCategory === category.name
                          ? "bg-orange-600 text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {category.name} (
                      {PRODUCTS.filter((p) => p.category === category.name).length})
                    </button>
                  ))}
                </div>
              </div>

              <div className="divider-gradient my-4"></div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Price Range</h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="500"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      Rs {priceRange[0].toLocaleString()}
                    </span>
                    <span className="text-sm font-semibold">
                      Rs {priceRange[1].toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="divider-gradient my-4"></div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                  setPriceRange([0, 10000]);
                  setSortBy("newest");
                }}
                className="w-full py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, material, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-elegant pl-12 w-full"
                />
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Showing <span className="font-semibold">{filteredProducts.length}</span> products
              </p>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-fade-in-up"
                    style={{
                      animationDelay: `${index * 30}ms`,
                    }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No Products Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your filters or search query
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
