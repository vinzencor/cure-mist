import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Search, Eye } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function AdminOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const { toast } = useToast();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching orders:", error);
            toast({
                title: "Failed to fetch orders",
                description: error.message || "Check your RLS policies.",
                variant: "destructive"
            });
        } else {
            setOrders(data || []);
            console.log("Orders fetched:", data?.length); // Debug log
        }
        setLoading(false);
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ order_status: newStatus })
            .eq('id', orderId);

        if (error) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        } else {
            toast({ title: "Success", description: `Order updated to ${newStatus}` });
            fetchOrders(); // Refresh
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_info?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_info?.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'processing': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
            case 'order received': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
            case 'shipped': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
            case 'delivered': return 'bg-green-100 text-green-800 hover:bg-green-100';
            case 'cancelled': return 'bg-red-100 text-red-800 hover:bg-red-100';
            default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-purple-900">Orders</h2>
                    <p className="text-muted-foreground">Manage and track customer orders.</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by Order ID, Customer Name, or Email..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="order received">Order Received</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">Loading orders...</TableCell>
                                </TableRow>
                            ) : filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">No orders found.</TableCell>
                                </TableRow>
                            ) : (
                                filteredOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium text-xs font-mono">{order.id.slice(0, 8)}...</TableCell>
                                        <TableCell>{format(new Date(order.created_at), 'MMM dd, yyyy')}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{order.customer_info?.firstName} {order.customer_info?.lastName}</span>
                                                <span className="text-xs text-muted-foreground">{order.customer_info?.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>₹{order.total_price}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(order.order_status)} variant="outline">
                                                {order.order_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
                                                        <DialogHeader>
                                                            <DialogTitle>Order Details - #{order.id}</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="grid md:grid-cols-2 gap-6 mt-4">
                                                            <div>
                                                                <h3 className="font-semibold text-purple-900 mb-2">Customer Info</h3>
                                                                <div className="text-sm space-y-1">
                                                                    <p><span className="font-medium">Name:</span> {order.customer_info?.firstName} {order.customer_info?.lastName}</p>
                                                                    <p><span className="font-medium">Email:</span> {order.customer_info?.email}</p>
                                                                    <p><span className="font-medium">Phone:</span> {order.customer_info?.phone}</p>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-purple-900 mb-2">Payment Info</h3>
                                                                <div className="text-sm space-y-1">
                                                                    <p><span className="font-medium">Status:</span> {order.payment_status}</p>
                                                                    <p><span className="font-medium">Total:</span> ₹{order.total_price}</p>
                                                                    <p><span className="font-medium">Created:</span> {format(new Date(order.created_at), 'PP p')}</p>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-purple-900 mb-2">Shipping Address</h3>
                                                                <div className="text-sm text-gray-600">
                                                                    {order.shipping_address?.street}<br />
                                                                    {order.shipping_address?.city}, {order.shipping_address?.state}<br />
                                                                    {order.shipping_address?.zip}, {order.shipping_address?.country}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-purple-900 mb-2">Order Action</h3>
                                                                <Select
                                                                    defaultValue={order.order_status}
                                                                    onValueChange={(val) => updateOrderStatus(order.id, val)}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Update Status" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="processing">Processing</SelectItem>
                                                                        <SelectItem value="order received">Order Received</SelectItem>
                                                                        <SelectItem value="shipped">Shipped</SelectItem>
                                                                        <SelectItem value="delivered">Delivered</SelectItem>
                                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
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
    );
}
