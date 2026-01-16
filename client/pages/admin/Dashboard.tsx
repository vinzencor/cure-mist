import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { IndianRupee, ShoppingCart, Users, TrendingUp } from 'lucide-react';


interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    recentOrders: any[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 0,
        totalOrders: 0,
        totalUsers: 0,
        recentOrders: []
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Orders for Stats and Chart
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;

            // 2. Fetch Users Count
            const { count: usersCount, error: usersError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            if (usersError) throw usersError;

            // 3. Calculate Stats
            const totalOrders = orders.length;
            const totalRevenue = orders.reduce((sum, order) => sum + (order.total_price || 0), 0);

            // 4. Prepare Chart Data (Revenue by Day)
            const revenueByDate: Record<string, number> = {};
            orders.forEach(order => {
                const date = new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                revenueByDate[date] = (revenueByDate[date] || 0) + (order.total_price || 0);
            });

            const chartDataFormatted = Object.keys(revenueByDate).map(date => ({
                date,
                revenue: revenueByDate[date]
            })).slice(0, 7).reverse(); // Last 7 unique days (approx)

            setStats({
                totalRevenue,
                totalOrders,
                totalUsers: usersCount || 0,
                recentOrders: orders.slice(0, 5)
            });
            setChartData(chartDataFormatted);

        } catch (error: any) {
            console.error('Error fetching dashboard data:', error);
            // Optional: Toast the error if accessible or just rely on console
        } finally {
            setLoading(false);
        }
    };

    const StatsCard = ({ title, value, icon: Icon, color }: any) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-purple-900">Dashboard</h2>
                <p className="text-muted-foreground">Overview of your store's performance.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatsCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    icon={IndianRupee}
                    color="text-green-600"
                />
                <StatsCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={ShoppingCart}
                    color="text-blue-600"
                />
                <StatsCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    color="text-orange-600"
                />
            </div>

            {/* Chart Section */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `₹${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="revenue" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Orders Section could go here, but we have a dedicated page */}
        </div>
    );
}
