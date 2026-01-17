import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/lib/cart";
import { supabase } from "@/lib/supabase";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";

export default function CartPage() {
  const { items, count, updateQty, removeItem, clearCart, subtotal } = useCart();
  const [coupon, setCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0); // Renamed from discountAmount for clarity
  const navigate = useNavigate();

  const memberDiscount = Math.round(subtotal * 0.05);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', coupon.trim().toUpperCase())
      .eq('is_active', true)
      .single();

    if (data) {
      if (data.discount_percentage) {
        setCouponDiscount(Math.round(subtotal * data.discount_percentage));
      } else if (data.discount_amount) {
        setCouponDiscount(data.discount_amount);
      }
      alert("Coupon applied!");
    } else {
      setCouponDiscount(0);
      alert("Invalid coupon code");
    }
  };

  const totalPayable = subtotal - memberDiscount - couponDiscount;


  return (
    <div className="min-h-screen pt-[110px] md:pt-[145px] bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-24">
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left: Items and actions */}
          <div className="lg:col-span-2">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <h2 className="text-xl md:text-2xl font-bold">Your Cart ({count} item{count !== 1 ? "s" : ""})</h2>
              <div className="flex gap-3 w-full md:w-auto">
                <button onClick={clearCart} className="text-sm text-red-600 font-semibold border border-red-200 px-3 md:px-4 py-2 rounded flex-1 md:flex-none">Clear Cart</button>
                <button onClick={() => navigate(-1)} className="text-sm bg-brand-yellow px-3 md:px-4 py-2 rounded text-brand-blue font-semibold flex-1 md:flex-none">Continue Shopping</button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-lg">Your cart is empty.</p>
                <button
                  onClick={() => {
                    navigate("/");
                    setTimeout(() => {
                      const el = document.getElementById("products");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="inline-block mt-4 bg-brand-yellow px-6 py-3 rounded text-brand-blue font-bold">
                  Go Shopping
                </button>

              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                {items.map((it) => (
                  <div key={it.id} className="flex flex-col md:flex-row md:items-center gap-4 border rounded p-3 md:p-4">
                    <img src={it.image} alt={it.title} className="w-full md:w-28 h-40 md:h-28 object-cover rounded" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{it.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{it.size}</p>
                      <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <div className="inline-flex items-center rounded-md bg-[#FFF8EC] p-2">
                          <button onClick={() => updateQty(it.id, it.quantity - 1)} className="px-3 py-2 text-lg text-brand-blue font-bold"><FiMinus /></button>
                          <div className="mx-3 bg-white px-6 py-2 rounded-md border shadow-sm">{it.quantity.toString().padStart(2, '0')}</div>
                          <button onClick={() => updateQty(it.id, it.quantity + 1)} className="px-3 py-2 text-lg text-brand-blue font-bold"><FiPlus /></button>
                        </div>

                        <div className="ml-auto text-right">
                          <div className="text-sm text-gray-700">Price: ₹{it.price}</div>
                          <div className="text-sm text-gray-500 line-through">{it.originalPrice ? `₹${it.originalPrice}` : ''}</div>
                          <div className="text-lg font-bold">₹{it.price * it.quantity}</div>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeItem(it.id)} className="text-red-500"><FiTrash2 /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Summary */}
          <aside className="rounded border p-4 md:p-6 bg-white">
            <h3 className="text-base md:text-lg font-semibold mb-4">Order Summary</h3>
            <div className="flex justify-between mb-2 text-sm">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            {/* Member Discount */}
            <div className="flex justify-between mb-2 text-sm text-green-600 font-medium">
              <span>Member Discount (5%)</span>
              <span>-₹{memberDiscount}</span>
            </div>

            {/* Coupon Discount */}
            {couponDiscount > 0 && (
              <div className="flex justify-between mb-4 text-sm text-green-600 font-medium">
                <span>Coupon Discount</span>
                <span>-₹{couponDiscount}</span>
              </div>
            )}

            <div className="mb-4 mt-4 border-t pt-4">
              <label className="block text-sm font-medium mb-2">Coupon</label>
              <div className="flex gap-2">
                <input value={coupon} onChange={(e) => setCoupon(e.target.value)} className="flex-1 border px-3 py-2 rounded text-sm" placeholder="Enter coupon code" />
                <button onClick={applyCoupon} className="bg-brand-blue text-white px-3 md:px-4 py-2 rounded text-sm font-medium">Apply</button>
              </div>
            </div>

            <div className="flex justify-between items-center border-t pt-4 mt-2">
              <span className="font-bold text-base md:text-lg">Total</span>
              <span className="font-bold text-base md:text-lg">₹{totalPayable > 0 ? totalPayable : 0}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-brand-yellow text-brand-blue font-bold py-3 rounded mt-6 hover:bg-[#816306] transition-colors text-sm md:text-base"
            >
              Checkout
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
