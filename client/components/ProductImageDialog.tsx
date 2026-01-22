import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "./ui/dialog";
import { FiMinus, FiPlus, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface ProductImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  size: string;
  price: string;
  originalPrice?: string;
  discountText: string;
  image: string;
  images?: string[];
  benefit?: string;
  form?: string;
  description?: string;
}

const parseNumber = (s?: string) => s ? (Number(s.replace(/[^\d]/g, "")) || 0) : 0;

export default function ProductImageDialog({
  open,
  onOpenChange,
  title,
  size,
  price,
  originalPrice,
  discountText,
  image,
  images,
  benefit,
  form,
  description,
}: ProductImageDialogProps) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [qty, setQty] = useState<number>(1);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // Use provided images array or fallback to single image
  const productImages = images && images.length > 0 ? images : [image];

  const numericPrice = parseNumber(price);
  const numericOriginal = parseNumber(originalPrice);
  const discountAmount = numericOriginal > numericPrice ? numericOriginal - numericPrice : 0;
  const total = numericPrice * qty;

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => q + 1);

  const formattedQty = (n: number) => n.toString().padStart(2, "0");

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleBuyNow = () => {
    if (!user) {
      onOpenChange(false);
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    
    // Add item to cart first
    const slug = `${title.replace(/\s+/g, "-").toLowerCase()}-${size.replace(/\s+/g, "").toLowerCase()}`;
    const numPrice = Number(price.replace(/[^\d]/g, "")) || 0;
    addItem({ id: slug, title, image, price: numPrice, quantity: qty, size }, qty);
    
    // Close dialog and navigate to checkout
    onOpenChange(false);
    navigate('/checkout');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-[1400px] h-[100vh] sm:h-[95vh] max-h-[100vh] sm:max-h-[95vh] p-0 overflow-hidden rounded-none sm:rounded-lg">
        {/* Close Button */}
        <DialogClose className="absolute right-2 top-2 sm:right-4 sm:top-4 rounded-full bg-white hover:bg-gray-100 p-2 sm:p-2.5 shadow-lg z-[100] transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-blue">
          <FiX className="h-5 w-5 sm:h-6 sm:w-6 text-brand-blue" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <div className="h-full flex flex-col lg:flex-row overflow-hidden">
          {/* Left Side - Image Gallery */}
          <div className="w-full lg:w-1/2 bg-gradient-to-br from-[#F8F9FF] to-[#FFF8F0] p-3 sm:p-4 md:p-8 lg:p-12 flex items-center justify-center relative overflow-y-auto min-h-[40vh] lg:min-h-full">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Main Image */}
              <div className="w-full max-w-[700px] h-full rounded-lg sm:rounded-2xl overflow-hidden shadow-2xl bg-white/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-8">
                <img 
                  src={productImages[currentImageIndex]} 
                  alt={`${title} - Image ${currentImageIndex + 1}`}
                  className="max-h-full max-w-full w-full h-full object-contain transition-all duration-300"
                />
              </div>

              {/* Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-1 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-1.5 sm:p-2 md:p-3 transition-all hover:scale-110 z-10"
                  >
                    <FiChevronLeft className="text-brand-blue text-lg sm:text-xl md:text-2xl" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-1 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-1.5 sm:p-2 md:p-3 transition-all hover:scale-110 z-10"
                  >
                    <FiChevronRight className="text-brand-blue text-lg sm:text-xl md:text-2xl" />
                  </button>
                </>
              )}

              {/* Image Indicators */}
              {productImages.length > 1 && (
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
                  {productImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                        idx === currentImageIndex 
                          ? 'bg-brand-blue w-4 sm:w-6' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Product Details */}
          <div className="w-full lg:w-1/2 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                {/* Title */}
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-brand-blue leading-tight pr-8 sm:pr-10">
                    {title}
                  </h2>
                </div>

                {/* Pricing Section */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-200">
                  <div className="flex items-baseline gap-2 sm:gap-3 mb-1 sm:mb-2 flex-wrap">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-black">{price}</span>
                    {originalPrice && (
                      <span className="text-base sm:text-lg text-gray-500 line-through">{originalPrice}</span>
                    )}
                    <span className="text-xs sm:text-sm font-semibold text-green-600 bg-green-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                      {discountText}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <p className="text-xs sm:text-sm text-green-700">You save ₹{discountAmount}!</p>
                  )}
                </div>

                {/* Product Specifications */}
                <div className="space-y-2 sm:space-y-3 bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <h3 className="font-semibold text-gray-900 text-xs sm:text-sm uppercase tracking-wide">Product Details</h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between items-center py-1.5 sm:py-2 border-b border-gray-200">
                      <span className="text-xs sm:text-sm text-gray-600">Weight/Size</span>
                      <span className="text-xs sm:text-sm font-bold text-brand-blue">{size.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 sm:py-2 border-b border-gray-200">
                      <span className="text-xs sm:text-sm text-gray-600">Product Benefit</span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900">{benefit ?? "Anti Fungal"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 sm:py-2">
                      <span className="text-xs sm:text-sm text-gray-600">Item Form</span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900">{form ?? "Spray"}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1.5 sm:mb-2 text-xs sm:text-sm uppercase tracking-wide">Description</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed">
                    {description ?? "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam."}
                  </p>
                </div>

                {/* Quantity Selector */}
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3 block uppercase tracking-wide">
                    Select Quantity
                  </label>
                  <div className="inline-flex items-center rounded-lg sm:rounded-xl bg-gradient-to-r from-[#FFF8EC] to-[#FFFBF0] p-1.5 sm:p-2 shadow-md border border-yellow-200">
                    <button 
                      onClick={dec} 
                      className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-lg sm:text-xl text-brand-blue font-bold hover:bg-white rounded-lg transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <FiMinus />
                    </button>
                    <div className="mx-2 sm:mx-3 md:mx-4 bg-white px-4 sm:px-6 md:px-8 py-1.5 sm:py-2 md:py-3 rounded-lg border-2 border-brand-yellow shadow-sm">
                      <span className="text-base sm:text-lg md:text-xl font-bold text-brand-blue">{formattedQty(qty)}</span>
                    </div>
                    <button 
                      onClick={inc} 
                      className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-lg sm:text-xl text-brand-blue font-bold hover:bg-white rounded-lg transition-colors"
                      aria-label="Increase quantity"
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>

                {/* Total Cost */}
                <div className="bg-brand-blue/5 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-brand-blue/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Total Cost</span>
                    <span className="text-xl sm:text-2xl md:text-3xl font-bold text-brand-blue">₹{total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-3 sm:p-4 md:p-6 bg-white border-t border-gray-200 mt-auto">
              <div className="w-full space-y-2 sm:space-y-3">
                <button 
                  onClick={handleBuyNow}
                  className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white px-4 sm:px-6 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                >
                  BUY NOW
                </button>
                <button 
                  onClick={() => {
                    const slug = `${title.replace(/\s+/g, "-").toLowerCase()}-${size.replace(/\s+/g, "").toLowerCase()}`;
                    const numPrice = Number(price.replace(/[^\d]/g, "")) || 0;
                    const numOriginalPrice = originalPrice ? Number(originalPrice.replace(/[^\d]/g, "")) || 0 : numPrice;
                    addItem({ id: slug, title, image, price: numPrice, originalPrice: numOriginalPrice, quantity: qty, size }, qty);
                    try { toast({ title: "✓ Added to cart", description: `${qty} item(s) added successfully` }); } catch { }
                  }} 
                  className="w-full bg-brand-yellow hover:bg-brand-yellow/90 text-brand-blue px-4 sm:px-6 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                >
                  ADD TO CART
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
