import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../utils/api';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { ShoppingBag, ShieldCheck, Truck, Headphones } from 'lucide-react';

const HomeScreen = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const { userInfo } = useAuthStore();

    useEffect(() => {
        if (userInfo?.isAdmin) {
            navigate('/admin/productlist');
        }
    }, [userInfo, navigate]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/api/products');
                setProducts(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <div className="relative bg-indigo-900 rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-transparent z-10"></div>
                <div className="relative z-20 px-8 py-16 md:py-24 max-w-2xl">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
                        Next-Gen Electronics for <span className="text-indigo-400">Your Modern Life.</span>
                    </h1>
                    <p className="mt-6 text-lg text-indigo-100 max-w-lg">
                        Discover the latest in premium tech, from high-performance laptops to immersive audio gear. Quality guaranteed.
                    </p>
                    <div className="mt-10 flex gap-4">
                        <button className="bg-white text-indigo-900 px-8 py-3 rounded-full font-bold hover:bg-indigo-50 transition shadow-lg">
                            Shop Now
                        </button>
                        <button className="border-2 border-white/30 text-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition backdrop-blur-sm">
                            Learn More
                        </button>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] opacity-20"></div>
                    <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full blur-[80px] opacity-20"></div>
                </div>
            </div>

            {/* Features Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-gray-100">
                <div className="flex flex-col items-center text-center gap-2">
                    <Truck className="h-8 w-8 text-indigo-600" />
                    <span className="font-bold text-gray-900">Free Shipping</span>
                    <span className="text-xs text-gray-500">On all orders over ₹1000</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                    <ShieldCheck className="h-8 w-8 text-indigo-600" />
                    <span className="font-bold text-gray-900">Secure Payment</span>
                    <span className="text-xs text-gray-500">100% Protected Payments</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                    <ShoppingBag className="h-8 w-8 text-indigo-600" />
                    <span className="font-bold text-gray-900">Premium Quality</span>
                    <span className="text-xs text-gray-500">Curated Tech Brands</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                    <Headphones className="h-8 w-8 text-indigo-600" />
                    <span className="font-bold text-gray-900">24/7 Support</span>
                    <span className="text-xs text-gray-500">Always here to help</span>
                </div>
            </div>

            {/* Products Section */}
            <div>
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Latest Products</h2>
                        <div className="h-1.5 w-20 bg-indigo-600 mt-2 rounded-full"></div>
                    </div>
                    <Link to="/products" className="text-indigo-600 font-bold hover:text-indigo-800 transition flex items-center gap-1">
                        View All <ShoppingBag className="h-4 w-4" />
                    </Link>
                </div>

                {loading ? (
                    <Loader />
                ) : error ? (
                    <Message variant="danger">{error}</Message>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <Product key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeScreen;
