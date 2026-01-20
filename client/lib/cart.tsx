import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

export interface CartItem {
  id: string; // product id
  title: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  quantity: number;
  size?: string;
}

interface AppliedCoupon {
  code: string;
  discount: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  addItem: (item: CartItem, qty?: number) => Promise<void>;
  updateQty: (id: string, qty: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  subtotal: number;
  appliedCoupon: AppliedCoupon | null;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const { toast } = useToast();

  const fetchCart = async () => {
    if (!user) {
      setItems([]);
      return;
    }

    try {
      // Get user's cart
      let { data: cart } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!cart) {
        // Create cart if not exists
        const { data: newCart, error } = await supabase
          .from("carts")
          .insert({ user_id: user.id })
          .select()
          .single();
        if (error) throw error;
        cart = newCart;
      }

      // Get cart items
      const { data: cartItems, error: itemsError } = await supabase
        .from("cart_items")
        .select(`
          quantity,
          product_id,
          title,
          price,
          image,
          size
        `)
        .eq("cart_id", cart.id);

      if (itemsError) throw itemsError;

      const formattedItems: CartItem[] = (cartItems || []).map((item: any) => ({
        id: item.product_id,
        title: item.title,
        image: item.image,
        price: Number(item.price),
        quantity: item.quantity,
        size: item.size
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const getCartId = async () => {
    if (!user) return null;
    let { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!cart) {
      const { data: newCart } = await supabase
        .from("carts")
        .insert({ user_id: user.id })
        .select()
        .single();
      cart = newCart;
    }
    return cart?.id;
  };

  const addItem = async (item: CartItem, qty = 1) => {
    if (!user) {
      toast({ title: "Please login to add items to cart", variant: "destructive" });
      return;
    }

    try {
      const cartId = await getCartId();
      if (!cartId) return;

      // Check if item exists
      const existing = items.find((i) => i.id === item.id);

      if (existing) {
        await updateQty(item.id, existing.quantity + qty);
      } else {
        const { error } = await supabase.from("cart_items").insert({
          cart_id: cartId,
          product_id: item.id,
          quantity: qty,
          title: item.title,
          price: item.price,
          image: item.image,
          size: item.size
        });

        if (error) throw error;
        await fetchCart();
        toast({ title: "Added to cart" });
      }
    } catch (error: any) {
      toast({ title: "Error adding to cart", description: error.message, variant: "destructive" });
    }
  };

  const updateQty = async (id: string, qty: number) => {
    if (!user) return;
    try {
      const cartId = await getCartId();
      if (!cartId) return;

      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: qty })
        .eq("cart_id", cartId)
        .eq("product_id", id);

      if (error) throw error;
      await fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  const removeItem = async (id: string) => {
    if (!user) return;
    try {
      const cartId = await getCartId();
      if (!cartId) return;

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cartId)
        .eq("product_id", id);

      if (error) throw error;
      await fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      const cartId = await getCartId();
      if (!cartId) return;

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cartId);

      if (error) throw error;
      setItems([]);
    } catch (error) {
      console.error(error);
    }
  };

  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);

  const value: CartContextValue = {
    items,
    count: items.reduce((c, it) => c + it.quantity, 0),
    addItem,
    updateQty,
    removeItem,
    clearCart,
    subtotal,
    appliedCoupon,
    setAppliedCoupon,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
