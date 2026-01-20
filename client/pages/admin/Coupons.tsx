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

    // Create Form State
    const [code, setCode] = useState("");
    const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
    const [value, setValue] = useState("");
    const [creating, setCreating] = useState(false);

    // Edit Form State
    const [editingCoupon, setEditingCoupon] = useState<any>(null);
    const [editCode, setEditCode] = useState("");
    const [editDiscountType, setEditDiscountType] = useState<"percentage" | "fixed">("percentage");
    const [editValue, setEditValue] = useState("");

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);

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
        } else {
            console.log("Fetched coupons:", data); // Debug log
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
            code: code.toUpperCase().trim(),
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

    const toggleStatus = async (code: string, currentStatus: boolean) => {
        const { error } = await supabase.from('coupons').update({ is_active: !currentStatus }).eq('code', code);
        if (error) {
            console.error("Status update error:", error);
            toast({ title: "Error updating status", description: error.message, variant: "destructive" });
        } else {
            fetchCoupons();
        }
    };

    const handleDelete = async (code: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;

        console.log("Attempting to delete coupon:", code);
        const { error } = await supabase.from('coupons').delete().eq('code', code);

        if (error) {
            console.error("Delete error details:", error);
            toast({ title: "Error deleting coupon", description: error.message || error.details, variant: "destructive" });
        } else {
            toast({ title: "Coupon deleted" });
            fetchCoupons();
        }
    };

    const openEditDialog = (coupon: any) => {
        setEditingCoupon(coupon);
        setEditCode(coupon.code);
        if (coupon.discount_percentage) {
            setEditDiscountType("percentage");
            setEditValue((coupon.discount_percentage * 100).toString());
        } else {
            setEditDiscountType("fixed");
            setEditValue(coupon.discount_amount);
        }
        setIsDialogOpen(true);
    };

    const handleUpdateCoupon = async () => {
        if (!editValue) {
            toast({ title: "Please set a value", variant: "destructive" });
            return;
        }

        const updates = {
            discount_percentage: editDiscountType === "percentage" ? parseFloat(editValue) / 100 : null,
            discount_amount: editDiscountType === "fixed" ? parseFloat(editValue) : null,
        };

        const { error } = await supabase
            .from('coupons')
            .update(updates)
            .eq('code', editingCoupon.code);

        if (error) {
            toast({ title: "Error updating coupon", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Coupon updated successfully" });
            setIsDialogOpen(false);
            setEditingCoupon(null);
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
                                        <TableRow key={coupon.code}>
                                            <TableCell className="font-bold font-mono">{coupon.code}</TableCell>
                                            <TableCell>
                                                {coupon.discount_percentage
                                                    ? `${(coupon.discount_percentage * 100).toFixed(0)}%`
                                                    : `₹${coupon.discount_amount}`
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={coupon.is_active}
                                                        onCheckedChange={() => toggleStatus(coupon.code, coupon.is_active)}
                                                    />
                                                    <Badge variant={coupon.is_active ? "default" : "secondary"}>
                                                        {coupon.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => openEditDialog(coupon)}>
                                                        Edit
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.code)} className="text-red-500">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Edit Dialog */}
            {isDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <Card className="w-full max-w-md bg-white p-6 relative">
                        <CardHeader>
                            <CardTitle>Edit Coupon: {editCode}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Discount Type</label>
                                <div className="flex gap-2">
                                    <Button
                                        variant={editDiscountType === "percentage" ? "default" : "outline"}
                                        onClick={() => setEditDiscountType("percentage")}
                                        className="flex-1"
                                    >
                                        Percentage (%)
                                    </Button>
                                    <Button
                                        variant={editDiscountType === "fixed" ? "default" : "outline"}
                                        onClick={() => setEditDiscountType("fixed")}
                                        className="flex-1"
                                    >
                                        Fixed Amount (₹)
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {editDiscountType === "percentage" ? "Percentage Value (0-100)" : "Amount (₹)"}
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={editValue}
                                    onChange={e => setEditValue(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleUpdateCoupon} className="bg-brand-blue">Save Changes</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
