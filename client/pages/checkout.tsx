import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { FiEye, FiEyeOff } from 'react-icons/fi';

declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('razorpay');

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
            phone: data.phone || '',
            sex: data.sex || '',
            dob: data.dob || ''
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

  // GST calculation (18% of subtotal before coupon discount)
  const gstAmount = subtotal * 0.18;

  // Save address and order to Supabase
  const saveOrderToSupabase = async (paymentStatus: string, razorpayPaymentId?: string) => {
    if (!user) {
      console.error('No user found when saving order');
      return null;
    }

    try {
      // 1. Save Address if not selected from saved and limit < 3
      if (!selectedAddressId && savedAddresses.length < 3) {
        const { data: existingAddresses } = await supabase
          .from('user_addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('street', shippingAddress.street)
          .eq('city', shippingAddress.city)
          .eq('state', shippingAddress.state)
          .eq('zip', shippingAddress.zip)
          .eq('country', shippingAddress.country);

        if (!existingAddresses || existingAddresses.length === 0) {
          await supabase.from('user_addresses').insert({
            user_id: user.id,
            ...shippingAddress
          });
        }
      }

      // 2. Create Order
      const orderData: any = {
        user_id: user.id,
        customer_info: customerInfo,
        shipping_address: shippingAddress,
        billing_address: sameAsBilling ? shippingAddress : billingAddress,
        subtotal,
        shipping_fee: shippingFee,
        gst_amount: gstAmount,
        total_price: totalPrice,
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        order_status: 'processing'
      };

      if (razorpayPaymentId) {
        orderData.razorpay_payment_id = razorpayPaymentId;
      }

      console.log('Creating order with data:', orderData);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      console.log('Order created successfully:', order);

      // 3. Create Order Items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: null,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      console.log('Creating order items:', orderItems);

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      // 4. Update Profile Info
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        first_name: customerInfo.firstName,
        last_name: customerInfo.lastName,
        phone: customerInfo.phone,
        updated_at: new Date()
      });

      if (profileError) console.error("Error syncing profile:", profileError);

      await clearCart();
      console.log('Order saved successfully, cart cleared');
      return order;
    } catch (error) {
      console.error('Error in saveOrderToSupabase:', error);
      throw error;
    }
  };

  // Razorpay payment handler
  const initiateRazorpayPayment = async () => {
    try {
      console.log('Creating Razorpay order with amount:', totalPrice);

      // 1. Create Razorpay order on server
      const response = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPrice,
          currency: 'INR',
          receipt: `order_${Date.now()}`,
        }),
      });

      const data = await response.json();
      console.log('Razorpay order response:', data);

      if (!response.ok) {
        console.error('Razorpay order creation failed:', data);
        throw new Error(data.error || 'Failed to create payment order');
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'Curemist',
        description: 'Ayurvedic Wound Spray Purchase',
        order_id: data.orderId,
        handler: async (response: any) => {
          try {
            console.log('Payment successful, verifying...', response);

            // 3. Verify payment on server
            const verifyRes = await fetch('/api/verify-razorpay-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            console.log('Verification response:', verifyData);

            if (verifyData.verified) {
              // 4. Save order to Supabase
              console.log('Saving order to database...');
              const order = await saveOrderToSupabase('paid', response.razorpay_payment_id);

              if (order) {
                toast({ title: 'Payment Successful! 🎉', description: 'Your order has been placed successfully.' });
                setTimeout(() => navigate('/profile'), 2000);
              } else {
                throw new Error('Failed to save order to database');
              }
            } else {
              toast({ title: 'Payment Verification Failed', description: 'Please contact support with payment ID: ' + response.razorpay_payment_id, variant: 'destructive' });
            }
          } catch (err: any) {
            console.error('Payment verification error:', err);
            toast({ title: 'Error', description: err.message || 'Failed to process payment', variant: 'destructive' });
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: `${customerInfo.firstName} ${customerInfo.lastName}`,
          email: customerInfo.email,
          contact: customerInfo.phone,
        },
        notes: {
          address: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.zip}`,
        },
        theme: {
          color: '#4A0E4E',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast({ title: 'Payment Cancelled', description: 'You can try again anytime.', variant: 'destructive' });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        setLoading(false);
        console.error('Payment failed:', response);
        toast({
          title: 'Payment Failed',
          description: response.error?.description || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      });
      rzp.open();
    } catch (err: any) {
      setLoading(false);
      console.error('Razorpay error:', err);
      toast({ title: 'Payment Error', description: err.message || 'Failed to initiate payment', variant: 'destructive' });
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to place an order.' });
      navigate('/login');
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

    if (paymentMethod === 'razorpay') {
      // Open Razorpay payment modal
      await initiateRazorpayPayment();
    } else {
      // COD flow
      try {
        console.log('Processing COD order...');
        const order = await saveOrderToSupabase('cod_pending');

        if (order) {
          toast({ title: 'Success', description: 'Order placed successfully!' });
          setTimeout(() => navigate('/profile'), 2000);
        } else {
          throw new Error('Failed to create order');
        }
      } catch (err: any) {
        console.error('COD order error:', err);
        toast({ title: 'Order Failed', description: err.message || 'Failed to place order', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
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

              {/* Payment Method Selection */}
              <section className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-bold text-curemist-purple mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {/* Pay Online - Razorpay */}
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'razorpay'
                        ? 'border-[#4A0E4E] bg-purple-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                    onClick={() => setPaymentMethod('razorpay')}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'razorpay'}
                        readOnly
                        className="w-5 h-5 text-[#4A0E4E] focus:ring-[#4A0E4E]"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="bg-blue-100 p-2.5 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Pay Online</h3>
                          <p className="text-xs text-gray-500 mt-0.5">UPI, Cards, Net Banking, Wallets</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <img src="https://cdn.razorpay.com/static/assets/logo/payment/upi.svg" alt="UPI" className="h-5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <img src="https://cdn.razorpay.com/static/assets/logo/payment/visa.svg" alt="Visa" className="h-5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <img src="https://cdn.razorpay.com/static/assets/logo/payment/mastercard.svg" alt="Mastercard" className="h-5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                    </div>
                    {paymentMethod === 'razorpay' && (
                      <div className="mt-3 pt-3 border-t border-purple-200">
                        <p className="text-xs text-gray-600">
                          ✔ Secure payment processed by Razorpay<br />
                          ✔ UPI, Debit/Credit Cards, Net Banking & Wallets accepted<br />
                          ✔ Instant order confirmation
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Cash on Delivery */}
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'cod'
                        ? 'border-green-500 bg-green-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'cod'}
                        readOnly
                        className="w-5 h-5 text-green-600 focus:ring-green-500"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="bg-green-100 p-2.5 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Cash on Delivery (COD)</h3>
                          <p className="text-xs text-gray-500 mt-0.5">Pay when your order arrives</p>
                        </div>
                      </div>
                    </div>
                    {paymentMethod === 'cod' && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="text-xs text-gray-600">
                          ✔ No advance payment required<br />
                          ✔ Pay only when you receive your order<br />
                          ✔ Verify product quality before payment
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full font-bold py-4 rounded-lg text-lg transition-colors disabled:opacity-50 shadow-md ${paymentMethod === 'razorpay'
                    ? 'bg-[#4A0E4E] text-white hover:bg-[#3a0b3e]'
                    : 'bg-brand-yellow text-brand-blue hover:bg-[#816306]'
                  }`}
              >
                {loading
                  ? 'Processing...'
                  : paymentMethod === 'razorpay'
                    ? `Pay ₹${totalPrice} Now`
                    : 'Place Order (COD)'}
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

            {/* Payment method badge */}
            <div className="mt-3 text-center">
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${paymentMethod === 'razorpay'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-green-100 text-green-800'
                }`}>
                {paymentMethod === 'razorpay' ? '💳 Paying Online' : '💵 Cash on Delivery'}
              </span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
