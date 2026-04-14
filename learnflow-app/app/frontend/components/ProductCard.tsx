"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/products";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  return (
    <Link href={`/products/${product.id}`}>
      <div className="card-product rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-pink-500/25 hover:-translate-y-3">
        {/* Product Image Container */}
        <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover img-zoom transition-transform duration-500 hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute top-3 right-3 badge-gold">
              -{discountPercent}%
            </div>
          )}

          {/* In Stock Badge */}
          {product.inStock && (
            <div className="absolute top-3 left-3 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold">
              In Stock
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
            className="absolute bottom-3 right-3 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur hover:bg-pink-500 hover:text-white transition-all duration-300"
          >
            <Heart
              size={20}
              className={isFavorite ? "fill-current" : ""}
            />
          </button>
        </div>

        {/* Product Info */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Category Badge */}
          <div className="mb-2">
            <span className="badge-pink text-xs">{product.category}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-serif text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-pink-500 transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.floor(product.rating)
                      ? "fill-current"
                      : "stroke-current fill-none"
                  }
                />
              ))}
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
              ({product.reviews} reviews)
            </span>
          </div>

          {/* Material */}
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
            {product.material}
          </p>

          {/* Price Section - Flexed to bottom */}
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  Rs {product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    Rs {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart?.(product);
              }}
              className="w-full btn-primary flex items-center justify-center gap-2 py-2 text-sm font-semibold mb-2"
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>

            {/* WhatsApp Button */}
            <a
              href="https://wa.me/03002385209"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(`https://wa.me/03002385209?text=I'm interested in ${product.name} (Rs ${product.price})`, '_blank');
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all duration-300 hover:shadow-lg"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-1.537.850-2.779 2.022-3.68 3.384-1.84 2.944-1.88 6.642-.108 9.742 1.868 3.12 5.37 5.066 9.319 5.066 1.697 0 3.308-.292 4.785-.87l3.421 1.128c.396.13.818-.042.995-.412l1.622-4.037c1.21-2.315 1.817-4.955 1.817-7.665 0-4.687-1.904-8.928-5.37-12.02-3.466-3.093-8.136-4.792-13.05-4.792z"/>
              </svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </Link>
  );
}
