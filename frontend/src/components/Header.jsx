import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import { ShoppingCart, User, LogOut, Zap } from 'lucide-react';
import SearchBox from './SearchBox';

const Header = () => {
    const { userInfo, logout } = useAuthStore();
    const { cartItems, clearCart } = useCartStore();

    const logoutHandler = async () => {
        try {
            await api.delete('/api/cart');
        } catch (err) {
            console.error('Failed to clear cart on server', err);
        }
        clearCart();
        logout();
    };

    return (
        <header className="bg-white shadow sticky top-0 z-[100]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-tight text-gray-900 group">
                            <div className="bg-yellow-500 p-1.5 rounded-lg group-hover:bg-yellow-600 transition-colors shadow-sm">
                                <Zap className="h-6 w-6 text-white fill-white" />
                            </div>
                            <span className="flex items-center">
                                <span className="text-gray-900">Adhithya</span>
                                <span className="ml-1 text-indigo-600">Electronics</span>
                            </span>
                        </Link>
                    </div>

                    <SearchBox />

                    <div className="hidden md:flex space-x-6 items-center">
                        <Link
                            to="/cart"
                            className="text-gray-700 hover:text-indigo-600 flex items-center gap-1"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            <span>Cart</span>
                            {cartItems.length > 0 && (
                                <span className="bg-indigo-600 text-white rounded-full px-2 py-0.5 text-xs">
                                    {cartItems.reduce((a, c) => a + c.qty, 0)}
                                </span>
                            )}
                        </Link>

                        {userInfo ? (
                            <div className="relative group">
                                <button className="text-gray-700 hover:text-indigo-600 flex items-center gap-1">
                                    <User className="h-5 w-5" />
                                    <span>{userInfo.name}</span>
                                </button>
                                {/* Dropdown */}
                                <div className="absolute right-0 pt-2 w-48 hidden group-hover:block z-50">
                                    <div className="bg-white border rounded-md shadow-lg overflow-hidden">
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Profile
                                        </Link>
                                        {userInfo.isAdmin && (
                                            <>
                                                <Link
                                                    to="/admin/dashboard"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    to="/admin/productlist"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Products
                                                </Link>
                                                <Link
                                                    to="/admin/orderlist"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Orders
                                                </Link>
                                                <Link
                                                    to="/admin/customers"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Customers
                                                </Link>
                                            </>
                                        )}
                                        <button
                                            onClick={logoutHandler}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                        >
                                            <LogOut className="h-4 w-4" /> Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="text-gray-700 hover:text-indigo-600 flex items-center gap-1"
                            >
                                <User className="h-5 w-5" />
                                <span>Sign In</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
