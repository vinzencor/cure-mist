import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/lib/cart";
import { supabase } from "@/lib/supabase";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";

export default function CartPage() {
  const { items, count, updateQty, removeItem, clearCart, subtotal, appliedCoupon, setAppliedCoupon } = useCart();
  const [coupon, setCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const navigate = useNavigate();

  // Fetch available coupons on component mount
  useEffect(() => {
    fetchAvailableCoupons();
  }, []);

  const fetchAvailableCoupons = async () => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setAvailableCoupons(data);
    }
  };

  const applyCoupon = async () => {
    if (!coupon.trim()) return;

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', coupon.trim().toUpperCase())
      .eq('is_active', true)
      .single();

    if (data) {
      let discount = 0;
      if (data.discount_percentage) {
        discount = Math.round(subtotal * data.discount_percentage);
      } else if (data.discount_amount) {
        discount = data.discount_amount;
      }
      setCouponDiscount(discount);
      setAppliedCoupon({ code: coupon.trim().toUpperCase(), discount });
      setCouponApplied(true);
      setTimeout(() => setCouponApplied(false), 3000);
    } else {
      setCouponDiscount(0);
      setAppliedCoupon(null);
      alert("Invalid coupon code");
    }
  };

  // Calculate MRP (Original Price) - sum of all original prices
  const mrpTotal = items.reduce((sum, item) => {
    const itemOriginalPrice = item.originalPrice || item.price;
    return sum + (itemOriginalPrice * item.quantity);
  }, 0);

  // Calculate 5% discount amount (difference between MRP and offer price)
  const discountAmount = mrpTotal - subtotal;

  const totalPayable = subtotal - couponDiscount;


  return (
    <div className="min-h-screen pt-[110px] md:pt-[145px] bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-24">
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left: Items and actions */}
          <div className="lg:col-span-2">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <h2 className="text-xl md:text-2xl font-bold">Your Cart ({count} item{count !== 1 ? "s" : ""})</h2>
              {items.length > 0 && (
                <div className="flex gap-3 w-full md:w-auto">
                  <button onClick={clearCart} className="text-sm text-red-600 font-semibold border border-red-200 px-3 md:px-4 py-2 rounded flex-1 md:flex-none">Clear Cart</button>
                  <button onClick={() => {
                  navigate(-1);
                  setTimeout(() => {
                    const el = document.getElementById("product-cards");
                    if (el) {
                      const offsetTop = el.offsetTop - 120;
                      window.scrollTo({
                        top: offsetTop,
                        behavior: "smooth",
                      });
                    }
                  }, 100);
                }} className="text-sm bg-brand-yellow px-3 md:px-4 py-2 rounded text-brand-blue font-semibold flex-1 md:flex-none">Continue Shopping</button>
                </div>
              )}
            </div>

            {items.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-lg">Your cart is empty.</p>
                <button
                  onClick={() => {
                    navigate("/");
                    setTimeout(() => {
                      const el = document.getElementById("product-cards");
                      if (el) {
                        const offsetTop = el.offsetTop - 120; // Offset for header
                        window.scrollTo({
                          top: offsetTop,
                          behavior: "smooth",
                        });
                      }
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
                          {it.originalPrice && it.originalPrice !== it.price && (
                            <div className="text-sm text-gray-500 line-through">₹{it.originalPrice}</div>
                          )}
                          <div className="text-sm text-gray-700">Price: ₹{it.price}</div>
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
          {items.length > 0 && (
            <aside className="rounded border p-4 md:p-6 bg-white">
              <h3 className="text-base md:text-lg font-semibold mb-4">Order Summary</h3>
              
              {/* Pricing Breakdown */}
              <div className="space-y-3 text-sm mb-4 pb-4 border-b">
                <div className="flex justify-between">
                  <span>MRP (Original Price)</span>
                  <span>₹{mrpTotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>5% Discount Amount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Subtotal (GST Included)</span>
                  <span>₹{subtotal}</span>
                </div>
              </div>

              {/* Coupon Discount */}
              {couponDiscount > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Coupon Discount ({appliedCoupon?.code})</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                  <button
                    onClick={() => {
                      setCouponDiscount(0);
                      setAppliedCoupon(null);
                      setCoupon("");
                    }}
                    className="text-xs text-red-600 hover:underline font-medium mt-1"
                  >
                    Remove Coupon
                  </button>
                </div>
              )}

            <div className="mb-4 mt-4 border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Coupon Code</label>
                {availableCoupons.length > 0 && (
                  <button
                    onClick={() => setShowCoupons(!showCoupons)}
                    className="text-xs text-brand-blue hover:underline font-medium"
                  >
                    {showCoupons ? 'Hide' : 'View Available Coupons'}
                  </button>
                )}
              </div>

              {/* Available Coupons Display */}
              {showCoupons && availableCoupons.length > 0 && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-semibold text-gray-700 mb-2">🎉 Available Coupons:</p>
                  <div className="space-y-2">
                    {availableCoupons.map((c) => (
                      <div
                        key={c.code}
                        className="flex items-center justify-between bg-white p-2 rounded border border-gray-200 cursor-pointer hover:border-brand-blue transition-colors"
                        onClick={() => {
                          setCoupon(c.code);
                          setShowCoupons(false);
                        }}
                      >
                        <div className="flex-1">
                          <p className="text-xs font-bold font-mono text-brand-blue">{c.code}</p>
                          <p className="text-xs text-gray-600">
                            {c.discount_percentage
                              ? `${(c.discount_percentage * 100).toFixed(0)}% off`
                              : `₹${c.discount_amount} off`}
                          </p>
                        </div>
                        <button
                          className="text-xs bg-brand-yellow text-brand-blue px-2 py-1 rounded font-semibold hover:bg-yellow-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCoupon(c.code);
                            setShowCoupons(false);
                          }}
                        >
                          Use
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <input value={coupon} onChange={(e) => setCoupon(e.target.value)} className="flex-1 border px-3 py-2 rounded text-sm" placeholder="Enter coupon code" />
                <button onClick={applyCoupon} className="bg-brand-blue text-white px-3 md:px-4 py-2 rounded text-sm font-medium">Apply</button>
              </div>
              {couponApplied && (
                <p className="text-green-600 text-sm font-semibold mt-2 flex items-center gap-1">
                  ✓ Coupon applied successfully!
                </p>
              )}
            </div>

            <div className="flex justify-between items-center border-t pt-4 mt-2">
              <span className="font-bold text-base md:text-lg">Total</span>
              <span className="font-bold text-base md:text-lg text-brand-blue">₹{totalPayable > 0 ? totalPayable : 0}</span>
            </div>

            <p className="text-green-600 text-xs mt-2 text-center">✔ Free shipping on all orders!</p>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-brand-yellow text-brand-blue font-bold py-3 rounded mt-6 hover:bg-[#816306] transition-colors text-sm md:text-base"
            >
              Checkout
            </button>
          </aside>
          )}
        </div>
      </div>
    </div>
  );
}
