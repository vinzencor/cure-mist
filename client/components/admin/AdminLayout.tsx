import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";

const ADMIN_EMAIL = "contact@altuspharma.in";

export default function AdminLayout() {
    const { user, loading, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                toast({ title: "Access Denied", description: "Please login to access admin panel.", variant: "destructive" });
                navigate('/login');
            } else if (user.email !== ADMIN_EMAIL) {
                toast({ title: "Unauthorized", description: "You do not have permission to access this area.", variant: "destructive" });
                navigate('/');
            }
        }
    }, [user, loading, navigate, toast]);

    if (loading || !user || user.email !== ADMIN_EMAIL) return null;

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
        { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
        { icon: Users, label: 'Users', path: '/admin/users' },
    ];

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside
                className={`bg-brand-blue text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'
                    } flex flex-col fixed h-full z-20 md:sticky md:top-0 md:h-screen`}
            >
                <div className="p-4 flex items-center justify-between border-b border-purple-800">
                    <Link to="/" className={`font-bold text-xl ${!isSidebarOpen && 'hidden'}`}>
                        Curemist Admin
                    </Link>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-purple-800 rounded">
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 py-4">
                    <ul className="space-y-2 px-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                            ? 'bg-brand-yellow text-purple-900 font-semibold'
                                            : 'hover:bg-purple-800 text-gray-100'
                                            }`}
                                    >
                                        <item.icon size={20} />
                                        {isSidebarOpen && <span>{item.label}</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="p-4 border-t border-purple-800">
                    <Button
                        variant="ghost"
                        className={`w-full text-red-300 hover:text-red-100 hover:bg-red-900/20 flex gap-3 ${!isSidebarOpen && 'justify-center px-0'}`}
                        onClick={handleSignOut}
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && "Sign Out"}
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 md:p-8">
                <Outlet />
            </main>
        </div>
    );
}
