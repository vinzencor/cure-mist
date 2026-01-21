import { Sheet, SheetTrigger } from "./ui/sheet";
import ProductDetailsSheet from "./ProductDetailsSheet";
import ProductImageDialog from "./ProductImageDialog";
import { useCart } from "@/lib/cart";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";

interface ProductCardProps {
  title: string;
  size: string;
  price: string;
  originalPrice?: string;
  discount: string;
  image: string;
  images?: string[];
  benefit?: string;
  form?: string;
  description?: string;
}

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

function AddToCartButton({ title, size, price, image }: { title: string; size: string; price: string; image: string }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAdd = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const slug = `${title.replace(/\s+/g, "-").toLowerCase()}-${size.replace(/\s+/g, "").toLowerCase()}`;
    const numericPrice = Number(price.replace(/[^\d]/g, "")) || 0;
    addItem({ id: slug, title, image, price: numericPrice, quantity: 1, size }, 1);
    try { toast({ title: "Added to cart" }); } catch { }
  };
  return (
    <button onClick={handleAdd} className="flex-1 bg-brand-yellow hover:bg-brand-yellow/90 text-brand-blue px-4 py-4 rounded-md text-sm font-bold transition-colors">
      ADD TO CART
    </button>
  );
}

export default function ProductCard({ title, size, price, originalPrice, discount, image, images, benefit, form, description }: ProductCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center">
        {/* Product Image Container */}
        <div 
          className="relative w-full max-w-[400px] h-[420px] mb-6 cursor-pointer group"
          onClick={() => setDialogOpen(true)}
        >
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105"
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity bg-brand-blue/90 px-6 py-3 rounded-lg">Click to View</span>
          </div>
          {/* Size Badge */}
          <div className="absolute bottom-4 right-4 bg-white/44 backdrop-blur-sm px-6 py-2 rounded-full">
            <span className="text-purple-badge text-lg font-bold">{size}</span>
          </div>
        </div>

      {/* Product Info */}
      <h3 className="text-xl font-semibold text-black text-center mb-2 leading-snug max-w-[242px]">
        {title}
      </h3>

      {/* Pricing */}
      <div className="flex items-center gap-3 mb-1">
        <span className="text-discount text-sm font-bold">{discount}</span>
        <span className="text-black text-[28px] font-bold">{price}</span>
      </div>
      <div className="mb-4">
        {originalPrice && <span className="text-gray-text text-lg font-medium line-through">{originalPrice}</span>}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 w-full max-w-[500px]">
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex-1 bg-[#E4E9FF] hover:bg-[#E4E9FF]/80 text-black px-4 py-4 rounded-md text-sm font-bold transition-colors">
              VIEW DETAILS
            </button>
          </SheetTrigger>
          <ProductDetailsSheet
            title={title}
            size={size}
            price={price}
            originalPrice={originalPrice}
            discountText={discount}
            image={image}
            benefit={benefit}
            form={form}
            description={description}
          />
        </Sheet>
        <AddToCartButton
          title={title}
          size={size}
          price={price}
          image={image}
        />
      </div>
    </div>

    {/* Product Image Dialog */}
    <ProductImageDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      title={title}
      size={size}
      price={price}
      originalPrice={originalPrice}
      discountText={discount}
      image={image}
      images={images}
      benefit={benefit}
      form={form}
      description={description}
    />
    </>
  );
}
