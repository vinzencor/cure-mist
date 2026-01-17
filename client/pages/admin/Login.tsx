import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const ADMIN_EMAIL = "contact@altuspharma.in";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Reset Password State
    const [resetEmail, setResetEmail] = useState("");
    const [resetLoading, setResetLoading] = useState(false);
    const [resetOpen, setResetOpen] = useState(false);

    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Pre-check email to save an API call if it's obviously wrong (optional but nice)
        if (email !== ADMIN_EMAIL) {
            toast({
                title: "Login Failed",
                description: "This portal is restricted to authorized personnel.",
                variant: "destructive",
            });
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast({
                title: "Login Failed",
                description: error.message,
                variant: "destructive",
            });
        } else {
            // Double check user email after login just to be sure
            if (data.user?.email !== ADMIN_EMAIL) {
                await supabase.auth.signOut();
                toast({
                    title: "Access Denied",
                    description: "You are not an administrator.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Welcome Back",
                    description: "Admin logged in successfully!",
                });
                navigate("/admin", { replace: true });
            }
        }
        setLoading(false);
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
            redirectTo: `${window.location.origin}/#recovery`,
        });
        console.log("Reset password result:", { data, error });
        setResetLoading(false);

        if (error) {
            console.error("Reset password error:", error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            toast({
                title: "Email Sent",
                description: "If an account exists, you will receive a reset link. Check your Spam folder."
            });
            setResetOpen(false);
            setResetEmail("");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-purple-900 px-4">
            <Card className="w-full max-w-md border-brand-yellow/20 shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-purple-900">Admin Portal</CardTitle>
                    <CardDescription className="text-center">Restricted Access. Login to continue.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="border-purple-200 focus:border-purple-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password">Password</Label>
                                <Dialog open={resetOpen} onOpenChange={setResetOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="link" className="px-0 h-auto font-normal text-xs text-brand-yellow">
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
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="border-purple-200 focus:border-purple-500"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-brand-yellow text-purple-900 hover:bg-yellow-500 font-bold"
                            disabled={loading}
                        >
                            {loading ? "Verifying Credentials..." : "Access Dashboard"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-xs text-gray-400">Authorized personnel only.</p>
                </CardFooter>
            </Card>
        </div>
    );
}
