import React, { useState } from 'react';
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const AuthPopup = ({ onClose }: { onClose: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
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
    } else {
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
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Registration Successful</h2>
          <p className="text-gray-600 text-lg mb-6">
            Please confirm your email to login.
          </p>
          <button onClick={() => {
            setRegistrationSuccess(false);
            setIsLogin(true);
            // onClose(); // Optional: close or switch to login
          }} className="w-full bg-[#FAFAFA] border border-gray-200 text-gray-900 px-4 py-2 rounded font-semibold hover:bg-gray-100">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
      {/* ... rest of the form ... */}
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xl font-bold text-gray-500 hover:text-black"
        >
          &times;
        </button>

        <h2 className="text-2xl text-purple-900 font-bold text-center mb-4">{isLogin ? "Login" : "Register"}</h2>

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
            <label htmlFor="password" className="block text-sm text-purple-900 font-semibold">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              placeholder="Enter your password"
              required
            />
          </div>

          {!isLogin && (
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm text-purple-900 font-semibold">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                placeholder="Confirm your password"
                required
              />
            </div>
          )}

          <div className="mb-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-[100px] bg-[#F2B705] text-purple-900 p-2 rounded hover:bg-[#816306] disabled:opacity-50"
            >
              {loading ? "..." : (isLogin ? "Login" : "Register")}
            </button>
          </div>
        </form>

        <div className="text-center text-sm mt-4">
          {isLogin ? (
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

