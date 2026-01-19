import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase, getAuthRedirectUrl } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Reset Password State
    const [resetEmail, setResetEmail] = useState("");
    const [resetLoading, setResetLoading] = useState(false);
    const [resetOpen, setResetOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);

        if (error) {
            toast({
                title: "Login Failed",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Success",
                description: "Logged in successfully!",
            });
            // Redirect to previous page if available, else home
            const from = (location.state as any)?.from?.pathname || "/";
            navigate(from, { replace: true });
        }
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
            setResetOpen(false);
            setResetEmail("");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-[110px] pb-10 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
                    <CardDescription className="text-center">Enter your email and password to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password">Password</Label>
                                <Dialog open={resetOpen} onOpenChange={setResetOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="link" className="px-0 h-auto font-normal text-xs text-brand-blue">
                                            Forgot password?
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Reset Password</DialogTitle>
                                            <DialogDescription>
                                                Enter your email address and we'll send you a link to reset your password.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleResetPassword} className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="reset-email">Email</Label>
                                                <Input
                                                    id="reset-email"
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    value={resetEmail}
                                                    onChange={(e) => setResetEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit" disabled={resetLoading}>
                                                    {resetLoading ? "Sending..." : "Send Reset Link"}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-brand-blue hover:underline font-semibold">
                            Register
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
