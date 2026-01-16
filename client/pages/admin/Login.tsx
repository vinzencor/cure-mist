import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const ADMIN_EMAIL = "contact@altuspharma.in";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
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
                            <Label htmlFor="password">Password</Label>
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
