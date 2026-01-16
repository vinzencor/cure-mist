import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Address {
  id?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Customer Information
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Saved Cards
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

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

  // Payment Information
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
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

      // Fetch Cards
      const fetchCards = async () => {
        const { data } = await supabase.from('user_cards').select('*').eq('user_id', user.id);
        if (data) setSavedCards(data);
      };

      fetchProfile();
      fetchAddresses();
      fetchCards();
    }
  }, [user]);

  const handleAddressSelect = (addr: Address) => {
    setShippingAddress(addr);
    setSelectedAddressId(addr.id || null);
  };

  const handleCardSelect = (card: any) => {
    setSelectedCardId(card.id);
    setPaymentInfo({
      cardNumber: `**** **** **** ${card.card_last4}`,
      expiryDate: card.expiry_date,
      cvv: '' // Always require CVV
    });
  };

  // Tax and Shipping Calculation
  // GST is already included in the product price, so we extract it for display purposes only
  const gstRate = 0.18; // 18% GST
  const gstAmount = Math.round(subtotal * (gstRate / (1 + gstRate))); // Extract GST from the inclusive subtotal
  const shippingFee = subtotal > 500 ? 0 : 100;
  const totalPrice = subtotal + shippingFee; // No additional GST since it's already in the subtotal

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

    // Check payment info if no card selected or if it is selected (checking CVV)
    if (!selectedCardId) {
      if (!paymentInfo.cardNumber || !paymentInfo.expiryDate || !paymentInfo.cvv) {
        toast({ title: 'Error', description: 'Please fill in all payment information' });
        return;
      }
    } else {
      if (!paymentInfo.cvv) {
        toast({ title: 'Error', description: 'Please enter CVV for the saved card' });
        return;
      }
    }

    setLoading(true);

    try {
      // 1. Save Address if not selected from saved and limit < 3
      if (!selectedAddressId && savedAddresses.length < 3) {
        await supabase.from('user_addresses').insert({
          user_id: user.id,
          ...shippingAddress
        });
      }

      // 2. Save Card if NEW (and valid)
      if (!selectedCardId && paymentInfo.cardNumber.length >= 15) {
        const last4 = paymentInfo.cardNumber.slice(-4);
        await supabase.from('user_cards').insert({
          user_id: user.id,
          card_last4: last4,
          expiry_date: paymentInfo.expiryDate,
          card_type: 'Credit Card' // Mock type
        });
      }

      // 3. Create Order
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
                <h2 className="text-xl font-bold text-curemist-purple mb-4">Payment Information</h2>

                {/* Saved Cards Selection */}
                {savedCards.length > 0 && (
                  <div className="mb-6 space-y-3">
                    <p className="text-sm font-semibold text-gray-700">Saved Cards</p>
                    {savedCards.map((card) => (
                      <div
                        key={card.id}
                        className={`flex items-center gap-3 border p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors ${selectedCardId === card.id ? 'border-brand-yellow bg-yellow-50' : ''}`}
                        onClick={() => handleCardSelect(card)}
                      >
                        <input
                          type="radio"
                          name="savedCard"
                          checked={selectedCardId === card.id}
                          readOnly
                          className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow"
                        />
                        <div className="text-sm flex flex-col">
                          <span className="font-bold">•••• •••• •••• {card.card_last4}</span>
                          <span className="text-xs text-gray-500">Expires {card.expiry_date}</span>
                        </div>
                      </div>
                    ))}
                    <div
                      className={`flex items-center gap-3 border p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors ${selectedCardId === null ? 'border-brand-yellow bg-yellow-50' : ''}`}
                      onClick={() => { setSelectedCardId(null); setPaymentInfo({ cardNumber: '', expiryDate: '', cvv: '' }); }}
                    >
                      <input
                        type="radio"
                        name="savedCard"
                        checked={selectedCardId === null}
                        readOnly
                        className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow"
                      />
                      <span className="text-sm font-semibold">Use a new card</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Card Number *</label>
                    <input
                      type="text"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                      className={`w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow ${selectedCardId ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                      placeholder="1234 5678 9012 3456"
                      maxLength={16}
                      required={!selectedCardId}
                      autoComplete="cc-number"
                      readOnly={!!selectedCardId}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Expiration Date (MM/YY) *</label>
                      <input
                        type="text"
                        value={paymentInfo.expiryDate}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length >= 2) {
                            setPaymentInfo({ ...paymentInfo, expiryDate: `${val.slice(0, 2)}/${val.slice(2, 4)}` });
                          } else {
                            setPaymentInfo({ ...paymentInfo, expiryDate: val });
                          }
                        }}
                        className={`w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow ${selectedCardId ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                        placeholder="MM/YY"
                        maxLength={5}
                        required={!selectedCardId}
                        autoComplete="cc-exp"
                        readOnly={!!selectedCardId}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">CVV/CVC *</label>
                      <input
                        type="password"
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                        placeholder="123"
                        maxLength={4}
                        required
                        autoComplete="cc-csc"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-yellow text-brand-blue font-bold py-4 rounded-lg text-lg hover:bg-[#816306] transition-colors disabled:opacity-50 shadow-md"
              >
                {loading ? "Processing Payment..." : "Place Order"}
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
                <span>Subtotal (Inc. GST)</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST Included (18%)</span>
                <span>₹{gstAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className={shippingFee === 0 ? 'text-green-600 font-semibold' : ''}>
                  {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center border-t pt-4 mt-4">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-xl text-brand-blue">₹{totalPrice}</span>
            </div>

            {shippingFee === 0 && (
              <p className="text-green-600 text-xs mt-2 text-center">Free shipping applied!</p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
