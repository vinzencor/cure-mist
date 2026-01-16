import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const tabs = ['Profile Information', 'Order History', 'Saved Cards', 'Address Information'] as const;

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState<number>(0);

  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [defaultAddressId, setDefaultAddressId] = useState<string | null>(null);

  // Profile Edit State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);

  // New address form state
  const [newAddressLine, setNewAddressLine] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newPincode, setNewPincode] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Password Change State
  const [newPassword, setNewPassword] = useState("");
  const [loadingPass, setLoadingPass] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    // Profile
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (prof) {
      setProfile(prof);
      setFirstName(prof.first_name || "");
      setLastName(prof.last_name || "");
      setPhone(prof.phone || "");
      setAvatarUrl(prof.avatar_url || "");
      setDefaultAddressId(prof.default_address_id);
    } else {
      // If profile doesn't exist for some reason, pre-fill from user metadata if available
      setFirstName(user.user_metadata?.first_name || "");
      setLastName(user.user_metadata?.last_name || "");
    }

    // Orders with Items
    const { data: ords } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (ords) setOrders(ords);

    // Addresses
    const { data: addrs } = await supabase.from('user_addresses').select('*').eq('user_id', user.id);
    if (addrs) setAddresses(addrs);

    // Saved Cards
    const { data: cards } = await supabase.from('user_cards').select('*').eq('user_id', user.id);
    if (cards) setSavedCards(cards);
  };

  const handleUpdateProfile = async () => {
    setLoadingProfile(true);
    const updates = {
      id: user!.id, // Required for upsert
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      avatar_url: avatarUrl,
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);

    if (error) {
      toast({ title: "Error updating profile", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated successfully" });
      fetchData();
    }
    setLoadingProfile(false);
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    const { error } = await supabase.from('profiles').upsert({
      id: user!.id,
      default_address_id: addressId,
      updated_at: new Date()
    });
    if (error) {
      toast({ title: "Error setting default address", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Default address updated" });
      setDefaultAddressId(addressId);
    }
  };

  const handleSaveAddress = async () => {
    if (!user) return;
    if (!newAddressLine.trim() || !newCity || !newState || !newPincode || !newCountry) {
      toast({ title: "Please fill all address fields" });
      return;
    }

    const { data: newAddr, error } = await supabase.from('user_addresses').insert({
      user_id: user.id,
      street: newAddressLine,
      city: newCity,
      state: newState,
      zip: newPincode,
      country: newCountry
    }).select().single();

    if (error) {
      toast({ title: "Error saving address", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Address saved" });
      setNewAddressLine(""); setNewCity(""); setNewState(""); setNewPincode(""); setNewCountry("");
      setShowAddForm(false);
      // If no default address, set this one
      if (!defaultAddressId && newAddr) {
        handleSetDefaultAddress(newAddr.id);
      }
      fetchData();
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword) return;
    setLoadingPass(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoadingPass(false);

    if (error) {
      toast({ title: "Error updating password", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated successfully" });
      setNewPassword("");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-[150px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">You must be logged in to view your profile.</p>
          <Button onClick={() => navigate('/login')} className="bg-brand-yellow text-brand-blue">Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[110px] md:pt-[145px] bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-24">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-4">
            <Button onClick={() => navigate('/')} className="bg-brand-yellow hover:bg-[#816306] text-[#311659] text-sm">Back to Home</Button>
          </div>
          <Button onClick={() => signOut().then(() => navigate('/login'))} variant="destructive" className="text-sm">Logout</Button>
        </div>

        <div className="text-xl md:text-2xl font-bold text-curemist-purple mb-6">My Profile</div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          <aside className="lg:col-span-1">
            <nav className="flex flex-col space-y-2">
              {tabs.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setActive(i)}
                  className={`text-left p-3 rounded ${i === active ? 'bg-brand-yellow text-brand-blue font-semibold' : 'text-muted-foreground'}`}
                >
                  {t}
                </button>
              ))}
            </nav>
          </aside>

          <section className="lg:col-span-3 bg-white rounded border p-6 min-h-[500px]">
            {/* Profile Information Tab */}
            {active === 0 && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Profile Image Section */}
                  <div className="flex flex-col items-center space-y-3">
                    <Avatar className="w-24 h-24 border-2 border-brand-yellow">
                      <AvatarImage src={avatarUrl} className="object-cover" />
                      <AvatarFallback className="text-2xl font-bold text-brand-blue bg-gray-100">
                        {firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="w-full max-w-xs text-center">
                      <label htmlFor="avatar-upload" className="text-xs font-semibold text-brand-blue cursor-pointer bg-brand-yellow px-3 py-1 rounded hover:bg-[#816306] hover:text-[#311659] transition-colors">
                        {loadingProfile ? "Uploading..." : "Upload Photo"}
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          try {
                            setLoadingProfile(true);
                            const fileExt = file.name.split('.').pop();
                            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                            const filePath = `${fileName}`;

                            const { error: uploadError } = await supabase.storage
                              .from('avatars')
                              .upload(filePath, file);

                            if (uploadError) throw uploadError;

                            const { data: { publicUrl } } = supabase.storage
                              .from('avatars')
                              .getPublicUrl(filePath);

                            setAvatarUrl(publicUrl);

                            // Auto-save avatar update
                            await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
                            toast({ title: "Profile photo updated!" });
                          } catch (error: any) {
                            toast({ title: "Error uploading image", description: error.message, variant: "destructive" });
                          } finally {
                            setLoadingProfile(false);
                          }
                        }}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">First Name</label>
                      <input
                        className="border p-3 rounded bg-white"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">Last Name</label>
                      <input
                        className="border p-3 rounded bg-white"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">Phone Number</label>
                      <input
                        className="border p-3 rounded bg-white"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone Number"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">Email Address</label>
                      <input className="border p-3 rounded bg-gray-100 text-gray-500 cursor-not-allowed" value={user.email || ''} readOnly />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleUpdateProfile} disabled={loadingProfile} className="bg-brand-yellow text-brand-blue font-bold px-8">
                    {loadingProfile ? "SAVING..." : "SAVE CHANGES"}
                  </Button>
                </div>

                <div className="mt-8 pt-8 border-t">
                  <h3 className="font-bold mb-4 text-[#311659]">Change Password</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">New Password</label>
                      <input
                        className="border p-3 rounded"
                        placeholder="New Password"
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleUpdatePassword} disabled={loadingPass} className="bg-brand-yellow text-brand-blue font-bold">
                      {loadingPass ? "UPDATING..." : "UPDATE PASSWORD"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Order History Tab */}
            {active === 1 && (
              <div>
                <h3 className="text-lg font-semibold mb-6">Order History</h3>
                {orders.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground mb-4">You don't have any orders yet.</p>
                    <button onClick={() => navigate('/')} className="bg-brand-yellow text-brand-blue px-6 py-2 rounded font-bold">START SHOPPING</button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((ord) => (
                      <div key={ord.id} className="border rounded-lg overflow-hidden shadow-sm">
                        <div className="bg-gray-50 p-4 border-b flex flex-wrap justify-between items-center gap-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Order Placed</p>
                            <p className="text-sm font-medium">{new Date(ord.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Total</p>
                            <p className="text-sm font-medium">₹{ord.total_price}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Order ID</p>
                            <p className="text-xs font-mono text-gray-600">{ord.id}</p>
                          </div>
                          <div className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase">
                            {ord.order_status}
                          </div>
                        </div>
                        <div className="p-4 space-y-4">
                          {ord.order_items && ord.order_items.map((item: any) => (
                            <div key={item.id} className="flex gap-4 items-start">
                              <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border">
                                {item.image ? (
                                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">No Img</div>
                                )}

                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-brand-blue">{item.title}</h4>
                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                <p className="text-sm font-semibold mt-1">₹{item.price}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Address Information Tab */}
            {active === 3 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Address Information</h3>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-brand-yellow text-brand-blue px-4 py-2 rounded font-bold text-sm"
                  >
                    + ADD NEW ADDRESS
                  </button>
                </div>
                {addresses.length === 0 && !showAddForm ? (
                  <div className="text-muted-foreground text-center py-8">No addresses yet.</div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((a, i) => (
                      <div key={i} className={`border p-4 rounded-lg flex items-start gap-4 ${defaultAddressId === a.id ? 'border-brand-yellow bg-yellow-50' : ''}`}>
                        <div className="pt-1">
                          <input
                            type="radio"
                            name="default_addr"
                            checked={defaultAddressId === a.id}
                            onChange={() => handleSetDefaultAddress(a.id)}
                            className="w-4 h-4 cursor-pointer text-brand-yellow focus:ring-brand-yellow"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-gray-800">{a.street}</p>
                              <p className="text-sm text-gray-600">{a.city}, {a.state} - {a.zip}</p>
                              <p className="text-sm text-gray-600">{a.country}</p>
                            </div>
                            {defaultAddressId === a.id && (
                              <span className="text-xs bg-brand-yellow text-brand-blue px-2 py-1 rounded font-bold">Default</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Show Address Form */}
                {showAddForm && (
                  <div className="mt-8 border-t pt-6 bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-bold mb-4">Add New Address</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <input
                        value={newAddressLine}
                        onChange={(e) => setNewAddressLine(e.target.value)}
                        className="border p-3 rounded"
                        placeholder="Address Line (Street, Flat, etc.)"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          className="border p-3 rounded"
                          placeholder="City"
                        />
                        <input
                          value={newState}
                          onChange={(e) => setNewState(e.target.value)}
                          className="border p-3 rounded"
                          placeholder="State"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          value={newPincode}
                          onChange={(e) => setNewPincode(e.target.value)}
                          className="border p-3 rounded"
                          placeholder="Pincode/Zip"
                        />
                        <input
                          value={newCountry}
                          onChange={(e) => setNewCountry(e.target.value)}
                          className="border p-3 rounded"
                          placeholder="Country"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          onClick={() => setShowAddForm(false)}
                          className="text-gray-500 hover:text-gray-700 font-semibold px-4"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveAddress}
                          className="bg-brand-yellow text-brand-blue px-6 py-3 rounded font-bold shadow-sm hover:shadow"
                        >
                          Save Address
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {active === 2 && (
              <div>
                <h3 className="text-lg font-semibold mb-6">Saved Cards</h3>
                {savedCards.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No saved cards found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedCards.map((card) => (
                      <div key={card.id} className="border p-4 rounded-lg bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow relative group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="bg-brand-blue text-white text-xs px-2 py-1 rounded">
                            {card.card_type || 'Card'}
                          </div>
                          <button
                            onClick={async () => {
                              if (!confirm("Are you sure you want to remove this card?")) return;
                              const { error } = await supabase.from('user_cards').delete().eq('id', card.id);
                              if (error) {
                                toast({ title: "Error deleting card", description: error.message, variant: "destructive" });
                              } else {
                                toast({ title: "Card removed" });
                                fetchData();
                              }
                            }}
                            className="text-red-500 hover:text-red-700 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            REMOVE
                          </button>
                        </div>
                        <div className="mb-4">
                          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Card Number</p>
                          <p className="font-mono text-xl font-bold text-gray-700">•••• •••• •••• {card.card_last4}</p>
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Expires</p>
                            <p className="font-mono text-sm font-semibold">{card.expiry_date}</p>
                          </div>
                          <div className="h-8 w-12 bg-gray-200 rounded opacity-50"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
