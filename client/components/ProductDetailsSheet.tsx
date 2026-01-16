import React, { useState } from "react";
import {
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "./ui/sheet";
import { FiMinus, FiPlus } from "react-icons/fi";
import { useCart } from "@/lib/cart";
import { toast } from "@/components/ui/use-toast";

interface ProductDetailsSheetProps {
  title: string;
  size: string;
  price: string; // e.g. "₹160"
  originalPrice: string; // e.g. "₹168"
  discountText: string; // e.g. "5% Off"
  image: string;
  benefit?: string;
  form?: string;
  description?: string;
}

const parseNumber = (s: string) => Number(s.replace(/[^\d]/g, "")) || 0;

export default function ProductDetailsSheet({
  title,
  size,
  price,
  originalPrice,
  discountText,
  image,
  benefit,
  form,
  description,
}: ProductDetailsSheetProps) {
  const { addItem } = useCart();
  const [qty, setQty] = useState<number>(1);

  const numericPrice = parseNumber(price);
  const numericOriginal = parseNumber(originalPrice);
  const discountAmount = numericOriginal - numericPrice;
  const total = numericPrice * qty;

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => q + 1);

  const formattedQty = (n: number) => n.toString().padStart(2, "0");

  return (
    <SheetContent side="right">
      <div className="max-w-[520px] w-full h-full flex flex-col">
        {/* Scrollable content area */}
        <div className="overflow-y-auto pr-2 pb-6">
          <div className="mb-6">
            <div className="rounded-md overflow-hidden">
              <div className="bg-gradient-to-r from-[#E6FFF6] to-[#FFF6E6] p-6 flex items-center justify-center">
                <img src={image} alt={title} className="max-h-[200px] object-contain mx-auto" />
              </div>
            </div>
          </div>

          <SheetHeader>
            <SheetTitle className="text-2xl font-bold text-black mb-2">{title}</SheetTitle>
            <div className="grid gap-3 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Item Weight</span>
                <span className="text-sm font-bold text-black">{size.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Product Benefit</span>
                <span className="text-sm font-bold text-black">{benefit ?? "Anti Fungal"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Item Form</span>
                <span className="text-sm font-bold text-black">{form ?? "Spray"}</span>
              </div>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed mb-6">{description ?? "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam."}</p>

            <div className="mb-6">
              <label className="text-sm text-gray-800 font-medium mb-2 block">Quantity</label>
              <div className="inline-flex items-center rounded-md bg-[#FFF8EC] p-2">
                <button onClick={dec} className="px-3 py-2 text-lg text-brand-blue font-bold"> <FiMinus /></button>
                <div className="mx-3 bg-white px-6 py-2 rounded-md border shadow-sm">{formattedQty(qty)}</div>
                <button onClick={inc} className="px-3 py-2 text-lg text-brand-blue font-bold"> <FiPlus /></button>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-700">Actual Price</span>
                <span className="text-sm font-medium text-black">{price}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-red-500">Discount ({discountText})</span>
                <span className="text-sm text-red-500">-₹{discountAmount}</span>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-lg font-bold">Total Cost</span>
                <span className="text-lg font-bold">₹{total}</span>
              </div>
            </div>
          </SheetHeader>
        </div>

        <SheetFooter className="mt-auto">
          <button onClick={() => {
            const slug = `${title.replace(/\s+/g, "-").toLowerCase()}-${size.replace(/\s+/g, "").toLowerCase()}`;
            const numPrice = Number(price.replace(/[^\d]/g, "")) || 0;
            addItem({ id: slug, title, image, price: numPrice, quantity: qty, size }, qty);
            try { toast({ title: "Added to cart" }); } catch {}
          }} className="w-full bg-brand-yellow hover:bg-brand-yellow/90 text-brand-blue px-6 py-4 rounded-md text-sm font-bold mt-2">ADD TO CART</button>
        </SheetFooter>

        <SheetClose />
      </div>
    </SheetContent>
  );
}
