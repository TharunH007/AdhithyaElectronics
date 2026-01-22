import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import Message from '../../components/Message';
import Loader from '../../components/Loader';

const ProductListScreen = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [loadingCreate, setLoadingCreate] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/api/products');
            setProducts(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure?')) {
            setLoadingDelete(true);
            try {
                await api.delete(`/api/products/${id}`);
                setLoadingDelete(false);
                fetchProducts();
            } catch (err) {
                alert(err.response?.data?.message || err.message);
                setLoadingDelete(false);
            }
        }
    };

    const createProductHandler = async () => {
        setLoadingCreate(true);
        try {
            const { data } = await api.post('/api/products');
            setLoadingCreate(false);
            navigate(`/admin/product/${data._id}/edit`);
        } catch (err) {
            alert(err.response?.data?.message || err.message);
            setLoadingCreate(false);
        }
    };

    return (
        <div className="container mx-auto mt-8">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Products</h1>
                <button
                    onClick={createProductHandler}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" /> Create Product
                </button>
            </div>

            {loadingDelete && <Loader />}
            {loadingCreate && <Loader />}
            {loading ? (
                <Loader />
            ) : error ? (
                <Message variant="danger">{error}</Message>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">MRP</th>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tax (%)</th>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Discount (%)</th>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Selling Price</th>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-4 font-mono text-xs text-gray-400">{product._id.substring(18)}</td>
                                    <td className="py-4 px-4 font-bold text-gray-900">{product.name}</td>
                                    <td className="py-4 px-4 font-medium text-gray-700">₹{product.mrp?.toLocaleString('en-IN')}</td>
                                    <td className="py-4 px-4 text-sm text-gray-600">{product.taxPercent || 0}%</td>
                                    <td className="py-4 px-4">
                                        <span className="px-2 py-1 rounded bg-amber-100 text-amber-700 text-xs font-black">
                                            {product.discountPercent || 0}% OFF
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-indigo-600 font-black text-lg">₹{product.price?.toLocaleString('en-IN')}</span>
                                    </td>
                                    <td className="py-4 px-4 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${product.countInStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {product.countInStock} Units
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex gap-2">
                                            <Link
                                                to={`/admin/product/${product._id}/edit`}
                                                className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-all shadow-sm"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => deleteHandler(product._id)}
                                                className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all shadow-sm"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ProductListScreen;
