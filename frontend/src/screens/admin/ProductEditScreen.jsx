import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import Message from '../../components/Message';
import Loader from '../../components/Loader';

const ProductEditScreen = () => {
    const { id: productId } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [image, setImage] = useState('');
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState(0);
    const [mrp, setMrp] = useState(0);
    const [discountPercent, setDiscountPercent] = useState(0);
    const [taxPercent, setTaxPercent] = useState(0);
    const [shippingPrice, setShippingPrice] = useState(0);
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/api/products/${productId}`);
                setName(data.name);
                setPrice(data.price);
                setImage(data.image);
                setBrand(data.brand);
                setCategory(data.category);
                setCountInStock(data.countInStock);
                setMrp(data.mrp || 0);
                setDiscountPercent(data.discountPercent || 0);
                setTaxPercent(data.taxPercent || 0);
                setDescription(data.description);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/api/categories');
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };

        fetchProduct();
        fetchCategories();
    }, [productId]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoadingUpdate(true);
        try {
            await api.put(`/api/products/${productId}`, {
                name,
                price: Number(price),
                image,
                brand,
                category,
                description,
                countInStock: Number(countInStock),
                mrp: Number(mrp),
                discountPercent: Number(discountPercent),
                taxPercent: Number(taxPercent),
                shippingPrice: Number(shippingPrice),
            });
            setLoadingUpdate(false);
            navigate('/admin/productlist');
        } catch (err) {
            alert(err.response?.data?.message || err.message);
            setLoadingUpdate(false);
        }
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            const { data } = await api.post('/api/upload', formData, config);
            setImage(data.url);
            setUploading(false);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || error.message);
            setUploading(false);
        }
    };

    return (
        <div className="container mx-auto mt-8 max-w-2xl px-4 pb-20">
            <Link to="/admin/productlist" className="text-gray-600 hover:underline mb-4 inline-block">
                &larr; Go Back
            </Link>

            <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

            {loadingUpdate && <Loader />}

            {loading ? (
                <Loader />
            ) : error ? (
                <Message variant="danger">{error}</Message>
            ) : (
                <form onSubmit={submitHandler} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            placeholder="Enter name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        />
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex justify-between items-center group">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Final Selling Price</p>
                            <p className="text-2xl font-black text-indigo-700">₹{Math.round(mrp * (1 - (discountPercent / 100))).toLocaleString('en-IN')}</p>
                            <p className="text-[10px] text-indigo-400 italic">Inclusive of ₹{Math.round((mrp * (1 - (discountPercent / 100))) * (taxPercent / 100)).toLocaleString('en-IN')} Tax</p>
                        </div>
                        <div className="text-right">
                            <span className="px-3 py-1 bg-white text-indigo-600 rounded-full text-xs font-black shadow-sm group-hover:scale-110 transition-transform inline-block">
                                AUTO-CALCULATED
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Image</label>
                        <input
                            type="text"
                            placeholder="Enter image url or use upload"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none mb-2"
                        />
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                id="image-file"
                                onChange={uploadFileHandler}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all"
                            />
                        </div>
                        {uploading && <Loader size="sm" />}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Brand</label>
                            <input
                                type="text"
                                placeholder="Enter brand"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none bg-white"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat.name}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Count In Stock</label>
                            <input
                                type="number"
                                placeholder="Enter count"
                                value={countInStock}
                                onChange={(e) => setCountInStock(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Pricing Configuration</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">MRP (₹)</label>
                                <input
                                    type="number"
                                    placeholder="MRP"
                                    value={mrp}
                                    onChange={(e) => setMrp(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tax (%)</label>
                                <input
                                    type="number"
                                    placeholder="Tax %"
                                    value={taxPercent}
                                    onChange={(e) => setTaxPercent(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Discount (%)</label>
                                <input
                                    type="number"
                                    placeholder="Discount %"
                                    value={discountPercent}
                                    onChange={(e) => setDiscountPercent(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none bg-amber-50"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                        <textarea
                            placeholder="Enter description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        ></textarea>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95 text-lg"
                        >
                            Update Product
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ProductEditScreen;
