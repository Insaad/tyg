import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Product } from '../types';
import { BOUTIQUE_INFO } from '../data/products';
import { ProductCard } from '../components/common/ProductCard';
import { getAssetUrl } from '../utils/assets';
import {
  Heart,
  MessageCircle,
  Scissors,
  Sparkles,
  Clock,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Truck,
  RotateCcw,
  Ruler,
  Share2,
  Check,
  Calendar,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const {
    activeProduct,
    setCurrentRoute,
    toggleWishlist,
    isInWishlist,
    formatPKR,
    createWhatsAppLink,
    openAppointmentModal,
    openSizeGuideModal,
    products,
  } = useShop();

  // If no product is active, default to first product
  const product: Product = activeProduct || products[0];

  const inWishlist = isInWishlist(product.id);
  const [selectedImage, setSelectedImage] = useState<string>(product.image);
  const [selectedSize, setSelectedSize] = useState<string>('Custom Made-to-Measure');
  const [selectedStitching, setSelectedStitching] = useState<'Made to Order' | 'Stitched' | 'Unstitched'>('Made to Order');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || 'As Shown in Editorial');
  const [copiedLink, setCopiedLink] = useState(false);

  // Collect all gallery images
  const allImages = Array.from(
    new Set([
      product.image,
      product.secondaryImage,
      ...(product.galleryImages || []),
    ].filter(Boolean) as string[])
  );

  const currentDisplayImage = selectedImage || product.image;

  // WhatsApp Order Link generator with exact specifications
  const handlePlaceOrderWhatsApp = () => {
    const msg = `As-salamu alaykum Ashrafi Bridal Studio! I would like to place an order for:

*Product*: ${product.name}
*Category*: ${product.categoryName}
*Price*: ${formatPKR(product.price)}
*Size*: ${selectedSize}
*Stitching Option*: ${selectedStitching}
*Selected Color*: ${selectedColor}
*Fabric*: ${product.fabric}
*Lead Time*: ${product.leadTime}

Please share booking availability, measurement details, and delivery schedule. Thank you!`;

    window.open(createWhatsAppLink(msg), '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Look at this luxury bridal masterpiece: ${product.name} at Ashrafi Bridal Studio`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Related products from same category or other bestsellers
  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.isBestseller))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-white text-[#1A1816]">
      {/* 1. Breadcrumb Bar */}
      <div className="border-b border-[#ECE6DE] bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs text-[#706456]">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => setCurrentRoute('home')}
              className="hover:text-[#9E7B3B] transition-colors"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#B8AC9E]" />
            <button
              onClick={() => setCurrentRoute('shop-all')}
              className="hover:text-[#9E7B3B] transition-colors"
            >
              Collections
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#B8AC9E]" />
            <span className="text-[#9E7B3B] font-medium">{product.categoryName}</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#B8AC9E]" />
            <span className="text-[#1A1816] font-semibold truncate max-w-[200px] sm:max-w-none">
              {product.name}
            </span>
          </div>

          <button
            onClick={() => setCurrentRoute('shop-all')}
            className="hidden sm:flex items-center gap-1.5 text-xs text-[#706456] hover:text-[#1A1816] font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Outfits</span>
          </button>
        </div>
      </div>

      {/* 2. Main Product Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: High-Resolution Visual Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#FAF8F5] border border-[#E8E2D8] shadow-sm">
              <img
                src={getAssetUrl(currentDisplayImage)}
                alt={product.name}
                className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute top-4 left-4 px-3 py-1 text-[10px] tracking-[0.2em] uppercase bg-white/95 text-[#1A1816] border border-[#E0D8CB] font-semibold shadow-xs">
                {product.status}
              </div>

              {/* Wishlist Button on Image */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`absolute top-4 right-4 p-2.5 backdrop-blur-md rounded-full shadow-md transition-all ${
                  inWishlist
                    ? 'bg-[#9E7B3B] text-white'
                    : 'bg-white/90 text-[#4A4238] hover:bg-[#1A1816] hover:text-white'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnails Gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-26 sm:w-24 sm:h-32 border shrink-0 overflow-hidden transition-all bg-white ${
                      currentDisplayImage === img
                        ? 'border-[#9E7B3B] ring-1 ring-[#9E7B3B] scale-102 shadow-xs'
                        : 'border-[#E0D8CB] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={getAssetUrl(img)}
                      alt={`${product.name} View ${idx + 1}`}
                      className="w-full h-full object-cover object-top"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Atelier Craftsmanship Trust Badges */}
            <div className="p-4 bg-[#FAF8F5] border border-[#E8E2D8] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#52483D] mt-6">
              <div className="flex items-center gap-2.5">
                <Scissors className="w-4 h-4 text-[#9E7B3B] shrink-0" />
                <span>3-Inch Inner Seam Margin for Fitting</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#9E7B3B] shrink-0" />
                <span>100% Wooden Karchob Hand-Needling</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-[#9E7B3B] shrink-0" />
                <span>Insured Global DHL Tracking</span>
              </div>
            </div>
          </div>

          {/* Right Column: Complete Specifications, Sizing & Order Action */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              {/* Category & Status */}
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-[#9E7B3B] font-semibold mb-2">
                <span>{product.categoryName}</span>
                <span>{product.pieces}</span>
              </div>

              {/* Title */}
              <h1
                className="text-3xl sm:text-4xl font-display font-medium text-[#1A1816] leading-tight"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-4 pb-4 border-b border-[#ECE6DE]">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1816] tabular-nums tracking-wide">
                  {formatPKR(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-[#8C7E70] line-through tabular-nums">
                    {formatPKR(product.originalPrice)}
                  </span>
                )}
                <span className="text-xs text-[#706456] ml-auto">Free Insured Courier</span>
              </div>
            </div>

            {/* Editorial Overview Description */}
            <p className="text-xs sm:text-sm text-[#5C5144] leading-relaxed">
              {product.description}
            </p>

            {/* Sizing Selector */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#1A1816]">
                  Select Sizing:
                </span>
                <button
                  onClick={openSizeGuideModal}
                  className="text-xs text-[#9E7B3B] hover:underline flex items-center gap-1 font-medium"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size & Measurement Guide</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {['XS (34")', 'S (36")', 'M (38")', 'L (41")', 'XL (44")', 'Custom Made-to-Measure'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 px-2 text-center text-xs border transition-all ${
                      selectedSize === size
                        ? 'border-[#9E7B3B] bg-[#1A1816] text-white font-semibold shadow-xs'
                        : 'border-[#E0D8CB] bg-white text-[#706456] hover:border-[#1A1816]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Stitching Option Selector */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#1A1816] block">
                Stitching Preference:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['Made to Order', 'Stitched', 'Unstitched'] as const).map((stitching) => (
                  <button
                    key={stitching}
                    onClick={() => setSelectedStitching(stitching)}
                    className={`py-2 px-2 text-center text-xs border transition-all ${
                      selectedStitching === stitching
                        ? 'border-[#9E7B3B] bg-[#FAF8F5] text-[#9E7B3B] font-semibold ring-1 ring-[#9E7B3B]'
                        : 'border-[#E0D8CB] bg-white text-[#706456] hover:border-[#1A1816]'
                    }`}
                  >
                    {stitching}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Swatch Options */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#1A1816] block">
                  Color Option:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`py-1.5 px-3 text-xs border transition-all ${
                        selectedColor === color
                          ? 'border-[#9E7B3B] bg-[#FAF8F5] text-[#1A1816] font-semibold'
                          : 'border-[#E0D8CB] bg-white text-[#706456] hover:border-[#1A1816]'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="pt-4 space-y-3">
              <button
                onClick={handlePlaceOrderWhatsApp}
                className="w-full py-4 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2.5 shadow-md active:scale-98"
              >
                <MessageCircle className="w-4 h-4 text-emerald-300" />
                <span>Place Order via WhatsApp</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`py-3 border text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-2xs ${
                    inWishlist
                      ? 'border-[#9E7B3B] bg-[#FAF8F5] text-[#9E7B3B]'
                      : 'border-[#E0D8CB] bg-white text-[#1A1816] hover:border-[#1A1816]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-current' : ''}`} />
                  <span>{inWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                </button>

                <button
                  onClick={() => openAppointmentModal(`Bridal Fitting for: ${product.name}`)}
                  className="py-3 border border-[#E0D8CB] hover:border-[#1A1816] bg-white text-[#1A1816] text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#9E7B3B]" />
                  <span>Book Atelier Fitting</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-[#706456] pt-1">
                <span>Direct Boutique Phone: <strong>{BOUTIQUE_INFO.phone}</strong></span>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 hover:text-[#1A1816] transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Link Copied!' : 'Share Ensemble'}</span>
                </button>
              </div>
            </div>

            {/* Complete Specifications Breakdown Table (Haseens Official Specification Architecture) */}
            <div className="pt-6 border-t border-[#ECE6DE] space-y-4">
              <span className="text-xs uppercase tracking-[0.25em] text-[#9E7B3B] font-semibold block">
                COUTURE SPECIFICATIONS
              </span>

              <div className="bg-[#FAF8F5] border border-[#E8E2D8] divide-y divide-[#EAE3D8] text-xs">
                {product.shirtFabric && (
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <strong className="text-[#1A1816] shrink-0 sm:w-36">Shirt / Bodice Fabric:</strong>
                    <span className="text-[#5C5144] sm:text-right">{product.shirtFabric}</span>
                  </div>
                )}

                {product.trouserFabric && (
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <strong className="text-[#1A1816] shrink-0 sm:w-36">Trouser / Bottom Fabric:</strong>
                    <span className="text-[#5C5144] sm:text-right">{product.trouserFabric}</span>
                  </div>
                )}

                {product.dupattaFabric && (
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <strong className="text-[#1A1816] shrink-0 sm:w-36">Dupatta Fabric & Work:</strong>
                    <span className="text-[#5C5144] sm:text-right">{product.dupattaFabric}</span>
                  </div>
                )}

                <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <strong className="text-[#1A1816] shrink-0 sm:w-36">Hand-Embroidery:</strong>
                  <span className="text-[#5C5144] sm:text-right">{product.embroidery}</span>
                </div>

                {product.silhouette && (
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <strong className="text-[#1A1816] shrink-0 sm:w-36">Cut & Silhouette:</strong>
                    <span className="text-[#5C5144] sm:text-right">{product.silhouette}</span>
                  </div>
                )}

                <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <strong className="text-[#1A1816] shrink-0 sm:w-36">Number of Pieces:</strong>
                  <span className="text-[#5C5144] sm:text-right">{product.pieces}</span>
                </div>

                <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <strong className="text-[#1A1816] shrink-0 sm:w-36">Production Lead Time:</strong>
                  <span className="text-[#5C5144] sm:text-right">{product.leadTime}</span>
                </div>

                {product.careInstructions && (
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <strong className="text-[#1A1816] shrink-0 sm:w-36">Care Instructions:</strong>
                    <span className="text-[#5C5144] sm:text-right">{product.careInstructions}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Handcrafted Details Highlights */}
            {product.details && product.details.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#1A1816] block">
                  Artisan Handwork Highlights:
                </span>
                <ul className="space-y-2 text-xs text-[#52483D]">
                  {product.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#9E7B3B] shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Related Creations Section */}
      {relatedProducts.length > 0 && (
        <section className="py-20 bg-[#FAF8F5] border-t border-[#ECE6DE]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs uppercase tracking-[0.3em] text-[#9E7B3B] font-semibold block mb-2">
                CURATED ATELIER
              </span>
              <h2
                className="text-3xl sm:text-4xl font-display text-[#1A1816]"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                You May Also Admire
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
