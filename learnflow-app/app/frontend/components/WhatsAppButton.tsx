/**
 * WhatsApp Button Component
 * Allows users to inquire about products via WhatsApp
 * Pre-fills message with product name, price, and link
 */

'use client'

import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  /**
   * Product name
   */
  productName: string;

  /**
   * Product price in PKR
   */
  productPrice: number;

  /**
   * Product ID for URL
   */
  productId: number;

  /**
   * Product category
   */
  productCategory?: string;

  /**
   * WhatsApp business phone number (format: 923001234567)
   * Default: from environment variable
   */
  phoneNumber?: string;

  /**
   * Custom button text
   */
  buttonText?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Button variant: primary, secondary, outline
   */
  variant?: 'primary' | 'secondary' | 'outline';

  /**
   * Size variant: sm, md, lg
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * WhatsAppButton Component
 * Creates a clickable button that opens WhatsApp with pre-filled product message
 */
export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  productName,
  productPrice,
  productId,
  productCategory = 'Product',
  phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923001234567',
  buttonText = 'Ask on WhatsApp',
  className = '',
  variant = 'primary',
  size = 'md',
}) => {
  /**
   * Generate WhatsApp message with product details
   */
  const generateMessage = (): string => {
    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || 'https://mens-boutique.com';

    const productUrl = `${baseUrl}/products/${productId}`;

    const message =
      `Hi! I'm interested in *${productName}*\n\n` +
      `Category: ${productCategory}\n` +
      `Price: Rs ${productPrice.toLocaleString('en-PK')}\n\n` +
      `Product Link: ${productUrl}\n\n` +
      `Could you provide more details?`;

    return message;
  };

  /**
   * Handle WhatsApp button click
   */
  const handleWhatsAppClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const message = generateMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    // Track analytics (optional)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'whatsapp_click', {
        product_name: productName,
        product_id: productId,
        product_price: productPrice,
      });
    }

    // Open in new tab
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    e.preventDefault();
  };

  /**
   * Style variations
   */
  const variantStyles = {
    primary: 'bg-green-500 hover:bg-green-600 text-white',
    secondary: 'bg-green-100 hover:bg-green-200 text-green-700',
    outline: 'border-2 border-green-500 text-green-500 hover:bg-green-50',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <a
      href="#whatsapp"
      onClick={handleWhatsAppClick}
      className={`
        inline-flex items-center gap-2
        rounded-lg font-medium
        transition-all duration-200
        cursor-pointer
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      title={`Ask about ${productName} on WhatsApp`}
      rel="noopener noreferrer"
    >
      <MessageCircle size={iconSize[size]} />
      <span>{buttonText}</span>
    </a>
  );
};

/**
 * WhatsApp Button Bar Component
 * Display multiple action buttons including WhatsApp
 */
interface WhatsAppButtonBarProps {
  productName: string;
  productPrice: number;
  productId: number;
  productCategory?: string;
  onAddToCart?: () => void;
}

export const WhatsAppButtonBar: React.FC<WhatsAppButtonBarProps> = ({
  productName,
  productPrice,
  productId,
  productCategory,
  onAddToCart,
}) => {
  return (
    <div className="flex gap-3 flex-wrap">
      <button
        onClick={onAddToCart}
        className="flex-1 min-w-[150px] bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        Add to Cart
      </button>

      <WhatsAppButton
        productName={productName}
        productPrice={productPrice}
        productId={productId}
        productCategory={productCategory}
        size="md"
        className="flex-1 min-w-[150px]"
      />

      <button
        className="flex-1 min-w-[150px] border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        Add to Wishlist
      </button>
    </div>
  );
};

/**
 * Floating WhatsApp Button
 * Display on bottom-right for quick access
 */
interface FloatingWhatsAppButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
  position?: 'bottom-right' | 'bottom-left';
}

export const FloatingWhatsAppButton: React.FC<FloatingWhatsAppButtonProps> = ({
  phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923001234567',
  defaultMessage = 'Hi! I have a question about your products.',
  position = 'bottom-left',
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
  };

  const handleClick = () => {
    const encodedMessage = encodeURIComponent(defaultMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed ${positionClasses[position]} z-30 group`}
    >
      <button
        onClick={handleClick}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        title="Contact us on WhatsApp"
        aria-label="Open WhatsApp chat"
      >
        <MessageCircle size={28} />
      </button>

      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 right-0 bg-gray-900 text-white text-sm py-2 px-3 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Chat with us
      </div>
    </div>
  );
};

export default WhatsAppButton;
