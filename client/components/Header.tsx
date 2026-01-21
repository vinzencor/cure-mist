import { ShoppingCart, User, LogOut, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/lib/cart";
import React, { useState, useRef, useEffect } from "react";
import AuthPopup from "./Authpopup";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

// Cart Count Component
function CartCount() {
  const { count } = useCart();
  return <span>Cart ({count})</span>;
}

export default function Header() {
  // State for showing/hiding profile popup
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  // toggle profile popup visibility
  const toggleProfilePopup = () => setShowProfilePopup(!showProfilePopup);

  // auth
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Handle logout
  const handleLogout = () => {
    signOut();
    setShowProfileMenu(false);
    navigate('/');
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white">
      {/* Top Scrolling Banner */}
      <div className="bg-brand-blue h-[50px] overflow-hidden relative">
    <div className="absolute inset-0 flex items-center">
    <div className="marquee-track">
      <div className="marquee-content">
        <span>Instant Protection • Faster Healing • 100% Ayurvedic Care •</span>
        <span>Instant Protection • Faster Healing • 100% Ayurvedic Care •</span>
        <span>Instant Protection • Faster Healing • 100% Ayurvedic Care •</span>
        <span>Instant Protection • Faster Healing • 100% Ayurvedic Care •</span>
      </div>

      {/* DUPLICATE for seamless loop */}
      <div className="marquee-content">
        <span>Instant Protection • Faster Healing • 100% Ayurvedic Care •</span>
        <span>Instant Protection • Faster Healing • 100% Ayurvedic Care •</span>
        <span>Instant Protection • Faster Healing • 100% Ayurvedic Care •</span>
        <span>Instant Protection • Faster Healing • 100% Ayurvedic Care •</span>
      </div>
    </div>
    </div>
   </div>

      {/* Main Navigation */}
      <div className="bg-brand-yellow h-[60px] md:h-[95px] flex items-center justify-between px-3 md:px-6 lg:px-24">
        {/* Logo */}
        <Link to="/" className="flex items-center flex-shrink-0">
          <img
            src="https://cure-mist.vercel.app/Logo.png"
            className="h-[35px] md:h-[62px] w-auto"
          />
        </Link>
        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-6 justify-end flex-shrink-0">
          <div className="hidden lg:flex px-6 py-2 rounded-[14px] border border-[#FFF0C3] bg-gradient-to-r from-[#FFE38D] to-[#FFD147]">
            <span className="text-black text-sm font-bold">Made by Scientists</span>
          </div>
          <div className="hidden lg:flex px-6 py-2 rounded-[14px] border border-[#FFF0C3] bg-gradient-to-r from-[#FFE38D] to-[#FFD147]">
            <span className="text-black text-sm font-bold">AYUSH approved</span>
          </div>
          <Link to="/blog" className=" md:flex items-center text-black text-xs md:text-sm font-semibold hover:opacity-80">
            BLOG
          </Link>
          {/* Profile Button / Login.... */}
          {!user ? (
            <button
              onClick={toggleProfilePopup}
              className="flex items-center gap-0.5 text-black text-xs md:text-sm font-medium hover:opacity-80 flex-shrink-0"
            >
              <User className="w-4 h-5 md:w-[17px] md:h-[22px] flex-shrink-0" />
              <span className="text-xs md:text-sm">Login</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 md:gap-3 relative flex-shrink-0" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-0.5 md:gap-2 text-black text-xs md:text-sm font-medium hover:opacity-80"
              >
                <Avatar className="w-7 h-7 md:w-10 md:h-10">
                  <AvatarFallback
                    className="bg-brand-yellow text-black font-bold text-xs md:text-sm border-2 border-black rounded-full w-full h-full flex items-center justify-center box-border"
                  >
                    {user?.email?.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs md:text-sm">My Profile</span>
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-black text-sm font-medium hover:bg-brand-yellow rounded-t-lg transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Account Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 text-sm font-medium hover:bg-red-50 rounded-b-lg transition-colors border-t border-gray-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
          <Link to="/cart" className="flex items-center gap-1 text-black text-xs md:text-sm font-medium hover:opacity-80 flex-shrink-0">
            <ShoppingCart className="w-5 h-4 md:w-[26px] md:h-[23px]" />
            <span className="text-xs md:text-sm"><CartCount /></span>
          </Link>
        </div>
      </div>

      {/* Render Profile Popup if visible */}
      {showProfilePopup && <AuthPopup onClose={toggleProfilePopup} />}
    </header>
  );
}
