import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sex: string;
  dob: string;
}

interface Address {
  id?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export default function Checkout() {
  const { items, subtotal, clearCart, appliedCoupon } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Customer Information
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    sex: '',
    dob: '',
  });

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Shipping Address
  const [shippingAddress, setShippingAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  // Billing Address
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [billingAddress, setBillingAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  useEffect(() => {
    if (user) {
      setCustomerInfo(prev => ({ ...prev, email: user.email || '' }));

      // Fetch Profile
      const fetchProfile = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (data) {
          setCustomerInfo({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: data.email || user.email || '',
            phone: data.phone || ''
          });

          if (data.default_address_id) {
            const { data: defAddr } = await supabase.from('user_addresses').select('*').eq('id', data.default_address_id).single();
            if (defAddr) {
              handleAddressSelect(defAddr);
            }
          }
        }
      };

      // Fetch Addresses
      const fetchAddresses = async () => {
        const { data } = await supabase.from('user_addresses').select('*').eq('user_id', user.id).limit(3);
        if (data) setSavedAddresses(data);
      };

      fetchProfile();
      fetchAddresses();
    }
  }, [user]);

  const handleAddressSelect = (addr: Address) => {
    setShippingAddress(addr);
    setSelectedAddressId(addr.id || null);
  };

  // Tax, Discount and Shipping Calculation
  // Calculate MRP (Original Price) - sum of all original prices
  const mrpTotal = items.reduce((sum, item) => {
    const itemOriginalPrice = item.originalPrice || item.price;
    return sum + (itemOriginalPrice * item.quantity);
  }, 0);

  // Calculate 5% discount amount (difference between MRP and offer price)
  const discountAmount = mrpTotal - subtotal;

  // GST is already included in the subtotal (offer price)
  const shippingFee = 0; // Free shipping for all orders

  // Coupon Discount
  const couponDiscount = appliedCoupon?.discount || 0;

  const totalPrice = Math.max(0, subtotal - couponDiscount);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to place an order.' });
      navigate('/login');
      return;
    }

    // Validation
    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email || !customerInfo.phone) {
      toast({ title: 'Error', description: 'Please fill in all customer information' });
      return;
    }

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip || !shippingAddress.country) {
      toast({ title: 'Error', description: 'Please fill in all shipping address fields' });
      return;
    }

    if (!sameAsBilling) {
      if (!billingAddress.street || !billingAddress.city || !billingAddress.state || !billingAddress.zip || !billingAddress.country) {
        toast({ title: 'Error', description: 'Please fill in all billing address fields' });
        return;
      }
    }

    setLoading(true);

    try {
      // 1. Save Address if not selected from saved and limit < 3
      if (!selectedAddressId && savedAddresses.length < 3) {
        // Check if this exact address already exists to prevent duplicates
        const { data: existingAddresses } = await supabase
          .from('user_addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('street', shippingAddress.street)
          .eq('city', shippingAddress.city)
          .eq('state', shippingAddress.state)
          .eq('zip', shippingAddress.zip)
          .eq('country', shippingAddress.country);

        // Only insert if address doesn't already exist
        if (!existingAddresses || existingAddresses.length === 0) {
          await supabase.from('user_addresses').insert({
            user_id: user.id,
            ...shippingAddress
          });
        }
      }

      // 2. Create Order
      const { data: order, error: orderError } = await supabase.from('orders').insert({
        user_id: user.id,
        customer_info: customerInfo,
        shipping_address: shippingAddress,
        billing_address: sameAsBilling ? shippingAddress : billingAddress,
        subtotal,
        shipping_fee: shippingFee,
        gst_amount: gstAmount,
        total_price: totalPrice,
        payment_status: 'paid', // Simulating successful payment
        order_status: 'processing'
      }).select().single();

      if (orderError) throw orderError;

      // 4. Create Order Items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: null,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // 5. Update Profile Info - SYNC WITH CHECKOUT
      // Always update profile with latest checkout info to ensure persistence
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        first_name: customerInfo.firstName,
        last_name: customerInfo.lastName,
        phone: customerInfo.phone,
        updated_at: new Date()
      });

      if (profileError) console.error("Error syncing profile:", profileError);

      await clearCart(); // Clears DB cart too

      toast({ title: 'Success', description: 'Order placed successfully!' });
      setTimeout(() => navigate('/profile'), 2000);

    } catch (err: any) {
      toast({ title: 'Order Failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-[150px] flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg mb-4">Your cart is empty.</p>
          <button onClick={() => navigate('/')} className="bg-brand-yellow text-brand-blue px-6 py-3 rounded font-bold">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[110px] md:pt-[145px] bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-24 py-6 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold text-curemist-purple mb-6 md:mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePlaceOrder} className="space-y-8">

              {/* Saved Addresses Selection */}
              {savedAddresses.length > 0 && (
                <section className="bg-white rounded-lg border p-6">
                  <h2 className="text-xl font-bold text-curemist-purple mb-4">Saved Addresses</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {savedAddresses.map((addr, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 border p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors ${selectedAddressId === addr.id ? 'border-brand-yellow bg-yellow-50' : ''}`}
                        onClick={() => handleAddressSelect(addr)}
                      >
                        <input
                          type="radio"
                          name="savedAddress"
                          checked={selectedAddressId === addr.id}
                          readOnly
                          className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow"
                        />
                        <div className="text-sm">
                          <p className="font-semibold">{addr.street}</p>
                          <p>{addr.city}, {addr.state} - {addr.zip}</p>
                        </div>
                      </div>
                    ))}
                    <div
                      className={`flex items-center gap-3 border p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors ${selectedAddressId === null ? 'border-brand-yellow bg-yellow-50' : ''}`}
                      onClick={() => {
                        setSelectedAddressId(null);
                        setShippingAddress({ street: '', city: '', state: '', zip: '', country: '' });
                      }}
                    >
                      <input
                        type="radio"
                        name="savedAddress"
                        checked={selectedAddressId === null}
                        readOnly
                        className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow"
                      />
                      <p className="text-sm font-semibold">Add New Address</p>
                    </div>
                  </div>
                </section>
              )}

              {/* Customer Information */}
              <section className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-bold text-curemist-purple mb-4">Customer Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name *</label>
                    <input
                      type="text"
                      value={customerInfo.firstName}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                      className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                      placeholder="First Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={customerInfo.lastName}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
                      className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                      placeholder="Last Name"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                      placeholder="Email Address"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                      placeholder="Phone Number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Sex *</label>
                    <select
                      value={customerInfo.sex}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, sex: e.target.value })}
                      className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white"
                      required
                    >
                      <option value="">Select Sex</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date of Birth *</label>
                    <input
                      type="date"
                      value={customerInfo.dob}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, dob: e.target.value })}
                      max="2009-12-31"
                      className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                      required
                    />
                  </div>
                </div>
              </section>

              {/* Shipping Address */}
              <section className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-bold text-curemist-purple mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Street Address *</label>
                    <input
                      type="text"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                      placeholder="Street Address"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">City/Town *</label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                        placeholder="City/Town"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">State/Province *</label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                        placeholder="State/Province"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">ZIP/Postal Code *</label>
                      <input
                        type="text"
                        value={shippingAddress.zip}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                        className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                        placeholder="ZIP/Postal Code"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Country *</label>
                      <input
                        type="text"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                        className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                        placeholder="Country"
                        required
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Billing Address */}
              <section className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-bold text-curemist-purple mb-4">Billing Address</h2>
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    id="sameAddress"
                    checked={sameAsBilling}
                    onChange={(e) => setSameAsBilling(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
                  />
                  <label htmlFor="sameAddress" className="ml-2 text-sm font-medium">
                    Billing address is the same as shipping address
                  </label>
                </div>

                {!sameAsBilling && (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Street Address *</label>
                      <input
                        type="text"
                        value={billingAddress.street}
                        onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })}
                        className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                        placeholder="Street Address"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">City/Town *</label>
                        <input
                          type="text"
                          value={billingAddress.city}
                          onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                          className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                          placeholder="City/Town"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">State/Province *</label>
                        <input
                          type="text"
                          value={billingAddress.state}
                          onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                          className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                          placeholder="State/Province"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">ZIP/Postal Code *</label>
                        <input
                          type="text"
                          value={billingAddress.zip}
                          onChange={(e) => setBillingAddress({ ...billingAddress, zip: e.target.value })}
                          className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                          placeholder="ZIP/Postal Code"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Country *</label>
                        <input
                          type="text"
                          value={billingAddress.country}
                          onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                          className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                          placeholder="Country"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Payment Information */}
              <section className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-bold text-curemist-purple mb-4">Payment Method</h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">Cash on Delivery (COD)</h3>
                      <p className="text-sm text-gray-600 mt-1">Pay with cash when your order is delivered</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-xs text-gray-600">
                      ✔ No advance payment required<br/>
                      ✔ Pay only when you receive your order<br/>
                      ✔ Verify product quality before payment
                    </p>
                  </div>
                </div>
              </section>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-yellow text-brand-blue font-bold py-4 rounded-lg text-lg hover:bg-[#816306] transition-colors disabled:opacity-50 shadow-md"
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <aside className="bg-white rounded-lg border p-4 md:p-6 h-fit lg:sticky lg:top-40">
            <h2 className="text-lg md:text-xl font-bold text-curemist-purple mb-4">Order Summary</h2>

            {/* Itemized List */}
            <div className="space-y-3 mb-6 pb-6 border-b max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="flex-1">{item.title} x {item.quantity}</span>
                  <span className="font-semibold">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-3 text-sm">
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
              {/* Coupon Discount Display */}
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600 font-semibold">
                  FREE
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center border-t pt-4 mt-4">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-xl text-brand-blue">₹{totalPrice}</span>
            </div>

            <p className="text-green-600 text-xs mt-2 text-center">✔ Free shipping on all orders!</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
