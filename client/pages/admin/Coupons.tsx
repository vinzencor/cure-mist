import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from "@/components/ui/use-toast";
import { Trash2 } from 'lucide-react';

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Form State
    const [code, setCode] = useState("");
    const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
    const [value, setValue] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching coupons:", error);
            // Don't show toast on 404/empty if table doesn't exist yet, but assuming it does
        } else {
            setCoupons(data || []);
        }
        setLoading(false);
    };

    const handleCreateCoupon = async () => {
        if (!code || !value) {
            toast({ title: "Please fill all fields", variant: "destructive" });
            return;
        }

        setCreating(true);
        const newCoupon = {
            code: code.toUpperCase(),
            discount_percentage: discountType === "percentage" ? parseFloat(value) / 100 : null,
            discount_amount: discountType === "fixed" ? parseFloat(value) : null,
            is_active: true
        };

        const { error } = await supabase.from('coupons').insert(newCoupon);

        if (error) {
            toast({ title: "Error creating coupon", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Coupon created successfully" });
            setCode("");
            setValue("");
            fetchCoupons();
        }
        setCreating(false);
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase.from('coupons').update({ is_active: !currentStatus }).eq('id', id);
        if (error) {
            toast({ title: "Error updating status", variant: "destructive" });
        } else {
            fetchCoupons();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;

        const { error } = await supabase.from('coupons').delete().eq('id', id);
        if (error) {
            toast({ title: "Error deleting coupon", variant: "destructive" });
        } else {
            toast({ title: "Coupon deleted" });
            fetchCoupons();
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-purple-900">Coupons</h2>
                <p className="text-muted-foreground">Manage discount coupons for your store.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Create Coupon Form */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Add New Coupon</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Coupon Code</label>
                            <Input
                                placeholder="e.g. SUMMER50"
                                value={code}
                                onChange={e => setCode(e.target.value.toUpperCase())}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Discount Type</label>
                            <div className="flex gap-2">
                                <Button
                                    variant={discountType === "percentage" ? "default" : "outline"}
                                    onClick={() => setDiscountType("percentage")}
                                    className="flex-1"
                                >
                                    Percentage (%)
                                </Button>
                                <Button
                                    variant={discountType === "fixed" ? "default" : "outline"}
                                    onClick={() => setDiscountType("fixed")}
                                    className="flex-1"
                                >
                                    Fixed Amount (₹)
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {discountType === "percentage" ? "Percentage Value (0-100)" : "Amount (₹)"}
                            </label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={value}
                                onChange={e => setValue(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleCreateCoupon} disabled={creating} className="w-full bg-brand-blue">
                            {creating ? "Creating..." : "Create Coupon"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Coupons List */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Active Coupons</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
                                    </TableRow>
                                ) : coupons.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8">No coupons found.</TableCell>
                                    </TableRow>
                                ) : (
                                    coupons.map((coupon) => (
                                        <TableRow key={coupon.id}>
                                            <TableCell className="font-bold font-mono">{coupon.code}</TableCell>
                                            <TableCell>
                                                {coupon.discount_percentage
                                                    ? `${coupon.discount_percentage * 100}%`
                                                    : `₹${coupon.discount_amount}`
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={coupon.is_active}
                                                        onCheckedChange={() => toggleStatus(coupon.id, coupon.is_active)}
                                                    />
                                                    <Badge variant={coupon.is_active ? "default" : "secondary"}>
                                                        {coupon.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)} className="text-red-500">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
