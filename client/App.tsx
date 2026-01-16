import "./global.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useEffect, useRef, useState } from "react";

import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/lib/auth";

import Preloader from "@/components/Preloader";

import Index from "./pages/Index";
import Blog from "./pages/blog";
import BlogDetail from "./pages/blogdetails";
import Cart from "./pages/cart";
import Checkout from "./pages/checkout";
import Profile from "./pages/profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/* ---------------- ROUTE WRAPPER ---------------- */

function AppRoutes() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const firstLoad = useRef(true);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (firstLoad.current) {
      firstLoad.current = false;
      timer = setTimeout(() => setLoading(false), 2000);
    } else {
      setLoading(true);
      timer = setTimeout(() => setLoading(false), 1200);
    }

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      {loading && <Preloader />}

      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

/* ---------------- APP ROOT ---------------- */

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
