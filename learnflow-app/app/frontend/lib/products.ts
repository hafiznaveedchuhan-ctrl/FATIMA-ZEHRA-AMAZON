export interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  originalPrice?: number;
  category: string;
  material: string;
  rating: number;
  reviews: number;
  inStock: boolean;
}

export interface Category {
  id: number;
  name: string;
}

export const CATEGORIES: Category[] = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Fashion" },
  { id: 3, name: "Home & Kitchen" },
  { id: 4, name: "Books" },
  { id: 5, name: "Toys & Games" },
  { id: 6, name: "Sports & Outdoors" },
  { id: 7, name: "Beauty" },
];

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    description: "Active noise cancellation, 30-hour battery life, premium sound.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    price: 8500,
    originalPrice: 12000,
    category: "Electronics",
    material: "Plastic, memory foam",
    rating: 4.5,
    reviews: 1240,
    inStock: true,
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    description: "Heart-rate monitor, GPS, waterproof — track every workout.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    price: 6500,
    originalPrice: 9000,
    category: "Electronics",
    material: "Silicone strap, aluminum",
    rating: 4.3,
    reviews: 870,
    inStock: true,
  },
  {
    id: 3,
    name: "Cotton Casual T-Shirt",
    description: "Breathable 100% cotton, regular fit, machine washable.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
    price: 1500,
    category: "Fashion",
    material: "100% cotton",
    rating: 4.2,
    reviews: 430,
    inStock: true,
  },
  {
    id: 4,
    name: "Stainless Steel Cookware Set",
    description: "10-piece induction-ready set with tempered glass lids.",
    image: "https://images.unsplash.com/photo-1584990347449-a8f0ab5dfb77?w=600",
    price: 15500,
    originalPrice: 22000,
    category: "Home & Kitchen",
    material: "Stainless steel",
    rating: 4.6,
    reviews: 315,
    inStock: true,
  },
  {
    id: 5,
    name: "Classic Hardcover Novel",
    description: "Award-winning bestseller — hardcover edition with dust jacket.",
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600",
    price: 1200,
    category: "Books",
    material: "Hardcover paper",
    rating: 4.8,
    reviews: 2100,
    inStock: true,
  },
  {
    id: 6,
    name: "Wooden Building Blocks",
    description: "100-piece educational block set for ages 3+.",
    image: "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600",
    price: 2800,
    category: "Toys & Games",
    material: "Beech wood",
    rating: 4.7,
    reviews: 560,
    inStock: true,
  },
  {
    id: 7,
    name: "Yoga Mat — Non-Slip",
    description: "6mm thick eco-friendly TPE mat with carrying strap.",
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600",
    price: 2200,
    category: "Sports & Outdoors",
    material: "TPE foam",
    rating: 4.4,
    reviews: 725,
    inStock: true,
  },
  {
    id: 8,
    name: "Hydrating Face Serum",
    description: "Vitamin C + hyaluronic acid — brightens and moisturizes.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600",
    price: 3200,
    originalPrice: 4500,
    category: "Beauty",
    material: "Glass bottle, 30ml",
    rating: 4.5,
    reviews: 980,
    inStock: true,
  },
];
