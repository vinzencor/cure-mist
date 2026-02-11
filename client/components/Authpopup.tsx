import React, { useState } from 'react';
import { supabase, getAuthRedirectUrl } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";

const AuthPopup = ({ onClose }: { onClose: () => void }) => {
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset Password State
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const toggleForm = () => {
    setView(view === 'login' ? 'register' : 'login');
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({ title: "Error", description: "Please enter your email address.", variant: "destructive" });
      return;
    }

    console.log("Attempting to reset password for:", resetEmail);
    setResetLoading(true);
    const { data, error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${getAuthRedirectUrl()}/#recovery`,
    });
    console.log("Reset password result:", { data, error });
    setResetLoading(false);

    if (error) {
      console.error("Reset password error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Password Reset Email Sent! 📧",
        description: `We've sent a password reset link to ${resetEmail}. Please check your inbox and spam folder.`
      });
      setView('login');
      setResetEmail("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast({ title: "Login Failed", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Logged in successfully!" });
          onClose();
        }
      } else if (view === 'register') {
        if (password !== confirmPassword) {
          toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: "https://cure-mist.vercel.app/",
          }
        });

        if (error) {
          toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
        } else {
          setRegistrationSuccess(true);
          toast({ title: "Success", description: "Registration successful! Please confirm your email." });
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please check your internet connection and try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  if (registrationSuccess) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative text-center">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-xl font-bold text-gray-500 hover:text-black"
          >
            &times;
          </button>
          <div className="flex justify-center mb-6 mt-4">
            <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900">Registration Successful! 🎉</h2>
          <p className="text-gray-700 text-base mb-3">
            We've sent a confirmation email to <strong className="text-purple-900">{email}</strong>
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-700 mb-2">
              <strong>📧 Check your email inbox</strong>
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Click the confirmation link in the email to activate your account.
            </p>
            <p className="text-xs text-gray-500">
              💡 <strong>Tip:</strong> If you don't see the email, please check your spam or junk folder.
            </p>
          </div>
          <button onClick={() => {
            setRegistrationSuccess(false);
            setView('login');
          }} className="w-full bg-[#FAFAFA] border border-gray-200 text-gray-900 px-4 py-2 rounded font-semibold hover:bg-gray-100">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Forgot Password View
  if (view === 'forgot') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-xl font-bold text-gray-500 hover:text-black"
          >
            &times;
          </button>
          <h2 className="text-2xl text-purple-900 font-bold text-center mb-4">Reset Password</h2>
          <p className="text-center text-gray-600 mb-6 text-sm">Enter your email to receive a reset link.</p>
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label htmlFor="reset-email" className="block text-sm text-purple-900 font-semibold">Email</label>
              <input
                type="email"
                id="reset-email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="mb-4 flex flex-col gap-2">
              <button
                type="submit"
                disabled={resetLoading}
                className="w-full bg-[#F2B705] text-purple-900 p-2 rounded hover:bg-[#816306] disabled:opacity-50 font-bold"
              >
                {resetLoading ? "Sending..." : "Send Reset Link"}
              </button>
              <button
                type="button"
                onClick={() => setView('login')}
                className="w-full text-gray-500 hover:text-gray-800 text-sm font-semibold"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xl font-bold text-gray-500 hover:text-black"
        >
          &times;
        </button>

        <h2 className="text-2xl text-purple-900 font-bold text-center mb-4">{view === 'login' ? "Login" : "Register"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm text-purple-900 font-semibold">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="block text-sm text-purple-900 font-semibold">Password</label>
              {view === 'login' && (
                <button type="button" onClick={() => setView('forgot')} className="text-xs text-brand-blue font-semibold hover:underline">
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mt-1 pr-10"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 translate-y-[5%] text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {view === 'register' && (
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm text-purple-900 font-semibold">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mt-1 pr-10"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 translate-y-[5%] text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
          )}

          <div className="mb-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-[100px] bg-[#F2B705] text-purple-900 p-2 rounded hover:bg-[#816306] disabled:opacity-50"
            >
              {loading ? "..." : (view === 'login' ? "Login" : "Register")}
            </button>
          </div>
        </form>

        <div className="text-center text-sm mt-4">
          {view === 'login' ? (
            <p>
              Don't have an account?{" "}
              <button
                onClick={toggleForm}
                className="text-purple-900 font-bold hover:underline"
              >
                Register now
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                onClick={toggleForm}
                className="text-purple-900 font-bold hover:underline"
              >
                Login here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPopup;

