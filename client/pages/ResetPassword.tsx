import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    // Password strength indicator
    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, label: "", color: "" };
        if (password.length < 6) return { strength: 1, label: "Weak", color: "text-red-500" };
        if (password.length < 10) return { strength: 2, label: "Medium", color: "text-yellow-500" };
        if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
            return { strength: 3, label: "Strong", color: "text-green-500" };
        }
        return { strength: 2, label: "Medium", color: "text-yellow-500" };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }

        if (newPassword.length < 6) {
            toast({
                title: "Error",
                description: "Password must be at least 6 characters long",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        setLoading(false);

        if (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } else {
            setSuccess(true);
            toast({
                title: "Success",
                description: "Your password has been reset successfully!",
            });
            setTimeout(() => navigate("/login"), 3000);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-[110px] pb-10 px-4">
                <Card className="w-full max-w-md text-center py-10 px-6">
                    <div className="flex justify-center mb-6">
                        <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold mb-4">Password Reset Successful! 🎉</CardTitle>
                    <CardDescription className="text-gray-700 text-base mb-6">
                        Your password has been updated successfully. You can now log in with your new password.
                    </CardDescription>
                    <Button onClick={() => navigate("/login")} className="w-full bg-brand-blue hover:bg-brand-blue/90">
                        Go to Login
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-[110px] pb-10 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 bg-brand-blue/10 rounded-full flex items-center justify-center">
                            <Lock className="h-8 w-8 text-brand-blue" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">Reset Your Password</CardTitle>
                    <CardDescription className="text-center">Enter your new password below</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {newPassword && (
                                <p className={`text-xs ${passwordStrength.color}`}>
                                    Password strength: {passwordStrength.label}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Resetting Password..." : "Reset Password"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

