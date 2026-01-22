import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import api from '../utils/api';
import { ChevronRight, Search as SearchIcon } from 'lucide-react';

const SearchScreen = () => {
    const { keyword, category } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                console.log('Frontend search params:', { keyword, category });
                const { data } = await api.get(`/api/products?keyword=${keyword || ''}&category=${category || ''}`);
                setProducts(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchProducts();
    }, [keyword, category]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link to="/" className="hover:text-indigo-600">Home</Link>
                <ChevronRight size={14} />
                <span className="font-medium text-gray-900">Search Results</span>
                {category && (
                    <>
                        <ChevronRight size={14} />
                        <span className="font-medium text-indigo-600">{category}</span>
                    </>
                )}
                {keyword && (
                    <>
                        <ChevronRight size={14} />
                        <span className="italic">"{keyword}"</span>
                    </>
                )}
            </nav>

            <div className="flex items-center gap-3 mb-8">
                <div className="bg-indigo-600 p-2 rounded-lg">
                    <SearchIcon size={20} className="text-white" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    {keyword ? `Results for "${keyword}"` : 'All Products'}
                </h1>
                <span className="ml-2 text-sm text-gray-400 font-medium">({products.length} items found)</span>
            </div>

            {loading ? (
                <Loader />
            ) : error ? (
                <Message variant="danger">{error}</Message>
            ) : products.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="flex justify-center mb-4">
                        <SearchIcon size={48} className="text-gray-300" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No matching products found</h2>
                    <p className="text-gray-500 mb-6">Try checking your spelling or use more general keywords.</p>
                    <Link to="/" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md">
                        Back to Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Product key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchScreen;
