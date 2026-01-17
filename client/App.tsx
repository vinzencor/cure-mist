import "./global.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useEffect, useRef, useState } from "react";
import { toast } from "@/components/ui/use-toast";

import { CartProvider } from "@/lib/cart";
import { AuthProvider, useAuth } from "@/lib/auth";

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

// Admin Components
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminUsers from "./pages/admin/Users";
import AdminCoupons from "./pages/admin/Coupons";
import AdminLogin from "./pages/admin/Login";

const queryClient = new QueryClient();

/* ---------------- ROUTE WRAPPER ---------------- */

function AppRoutes() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const firstLoad = useRef(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (firstLoad.current) {
      firstLoad.current = false;
      timer = setTimeout(() => setLoading(false), 2000);
    } else {
      setLoading(true);
      timer = setTimeout(() => setLoading(false), 1200);
    }

    // Handle Supabase Auth Redirects (Email Verification, Password Reset)
    if (location.hash) {
      const params = new URLSearchParams(location.hash.substring(1));
      const type = params.get("type");
      const accessToken = params.get("access_token");

      if (accessToken && user) {
        if (type === "signup") {
          toast({
            title: "Email Verified",
            description: "Your email has been successfully verified. Welcome!"
          });
          navigate("/?welcome=true", { replace: true });
        } else if (type === "recovery") {
          toast({
            title: "Password Reset",
            description: "Please set a new password."
          });
          // navigate("/reset-password", { replace: true }); // Future implementation
          navigate("/profile", { replace: true });
        }
      }
    }

    return () => clearTimeout(timer);
  }, [location, user, navigate]);

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

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="coupons" element={<AdminCoupons />} />
        </Route>

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
