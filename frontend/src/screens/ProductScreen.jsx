import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import Rating from '../components/Rating';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { Zap } from 'lucide-react';

const ProductScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [qty, setQty] = useState(1);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loadingProductReview, setLoadingProductReview] = useState(false);
    const [errorProductReview, setErrorProductReview] = useState(null);
    const [successProductReview, setSuccessProductReview] = useState(false);

    const { addToCart } = useCartStore();
    const { userInfo } = useAuthStore();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const { data } = await api.get(`/api/products/${id}`);
                setProduct(data);
                setLoading(false);
            } catch (err) {
                setError(err.response && err.response.data.message ? err.response.data.message : err.message);
                setLoading(false);
            }
        };

        if (successProductReview) {
            setRating(0);
            setComment('');
            setSuccessProductReview(false);
        }

        fetchProduct();
    }, [id, successProductReview]);

    const addToCartHandler = () => {
        addToCart({
            product: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            qty: Number(qty)
        });
        navigate('/cart');
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoadingProductReview(true);
        try {
            await api.post(`/api/products/${id}/reviews`, { rating, comment });
            setSuccessProductReview(true);
            setLoadingProductReview(false);
        } catch (err) {
            setErrorProductReview(err.response && err.response.data.message ? err.response.data.message : err.message);
            setLoadingProductReview(false);
        }
    };

    if (loading) return <Loader />;
    if (error) return <Message variant="danger">{error}</Message>;
    if (!product) return <Message variant="danger">Product not found</Message>;

    return (
        <div>
            <Link className="inline-block mb-4 text-indigo-600 hover:underline" to="/">
                Go Back
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                <div className="bg-white p-4 rounded-lg shadow-sm h-fit">
                    <img src={product.image} alt={product.name} className="w-full h-auto object-contain max-h-[500px]" />
                </div>

                <div className="space-y-6">
                    <div className="border-b pb-4">
                        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                        <p className="text-gray-500 mt-2">Brand: {product.brand}</p>
                        <div className="mt-2">
                            <Rating value={product.rating} text={`${product.numReviews} reviews`} />
                        </div>
                    </div>

                    <div className="text-gray-700">
                        <p className="text-lg font-semibold mb-1">Description:</p>
                        <p>{product.description}</p>
                    </div>

                    <div className="bg-white border rounded-md p-4 shadow-sm w-full max-w-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-3xl font-black text-gray-900 tracking-tight">
                                ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            {product.mrp > product.price && (
                                <span className="text-xl text-gray-400 line-through">
                                    ₹{product.mrp.toLocaleString('en-IN')}
                                </span>
                            )}
                            {product.mrp > product.price && (
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-sm font-bold">
                                    {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                                </span>
                            )}
                        </div>

                        <p className="text-gray-600 leading-relaxed mb-6">
                            {product.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <span className="block text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Status</span>
                                <span className={`text-sm font-bold ${product.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <span className="block text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Shipping</span>
                                <span className="text-sm font-bold text-gray-700 leading-tight">
                                    Calculated at checkout
                                </span>
                            </div>
                            {product.taxPercent > 0 && (
                                <div className="col-span-2 text-xs text-indigo-600 font-bold uppercase tracking-wider">
                                    MRP inclusive of all taxes
                                </div>
                            )}
                        </div>

                        {!userInfo?.isAdmin ? (
                            product.countInStock > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-700 font-medium">Quantity:</span>
                                        <select
                                            value={qty}
                                            onChange={(e) => setQty(Number(e.target.value))}
                                            className="bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        >
                                            {[...Array(product.countInStock).keys()].map((x) => (
                                                <option key={x + 1} value={x + 1}>
                                                    {x + 1}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        onClick={addToCartHandler}
                                        className="w-full bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98]"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            )
                        ) : (
                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-indigo-700 flex items-center gap-3">
                                <div className="bg-indigo-600 p-1.5 rounded-lg">
                                    <Zap className="h-5 w-5 text-white fill-white" />
                                </div>
                                <span className="font-semibold text-sm">You are viewing this product as an administrator.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <div>
                    <h2 className="text-2xl font-bold mb-4">Reviews</h2>
                    {product.reviews.length === 0 && <Message>No Reviews</Message>}
                    <div className="space-y-4">
                        {product.reviews.map((review) => (
                            <div key={review._id} className="bg-white p-4 rounded-lg shadow-sm border">
                                <p className="font-bold text-gray-900">{review.name}</p>
                                <Rating value={review.rating} />
                                <p className="text-gray-500 text-sm">{review.createdAt.substring(0, 10)}</p>
                                <p className="mt-2 text-gray-700">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border h-fit">
                    <h2 className="text-2xl font-bold mb-4">Write a Customer Review</h2>
                    {loadingProductReview && <Loader />}
                    {errorProductReview && <Message variant="danger">{errorProductReview}</Message>}
                    {userInfo ? (
                        <form onSubmit={submitHandler} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1">Rating</label>
                                <select
                                    className="w-full border rounded-md px-3 py-2"
                                    value={rating}
                                    onChange={(e) => setRating(e.target.value)}
                                    required
                                >
                                    <option value="">Select...</option>
                                    <option value="1">1 - Poor</option>
                                    <option value="2">2 - Fair</option>
                                    <option value="3">3 - Good</option>
                                    <option value="4">4 - Very Good</option>
                                    <option value="5">5 - Excellent</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1">Comment</label>
                                <textarea
                                    rows="4"
                                    className="w-full border rounded-md px-3 py-2"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={loadingProductReview}
                                className="bg-indigo-600 text-white px-4 py-2 rounded font-bold hover:bg-indigo-700 transition"
                            >
                                Submit
                            </button>
                        </form>
                    ) : (
                        <Message>
                            Please <Link to="/login" className="text-indigo-600 hover:underline">sign in</Link> to write a review
                        </Message>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductScreen;
