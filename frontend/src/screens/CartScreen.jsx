import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import useCartStore from '../store/cartStore';

const CartScreen = () => {
    const navigate = useNavigate();
    const { cartItems, removeFromCart, addToCart } = useCartStore();

    const checkoutHandler = () => {
        navigate('/login?redirect=/shipping');
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

            {cartItems.length === 0 ? (
                <div className="bg-blue-50 text-blue-700 p-4 rounded">
                    Your cart is empty <Link to="/" className="font-bold underline ml-1">Go Back</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.product} className="flex items-center justify-between bg-white p-4 rounded shadow-sm">
                                <div className="flex items-center space-x-4">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                                    <Link to={`/product/${item.product}`} className="font-semibold text-indigo-600 hover:underline">
                                        {item.name}
                                    </Link>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="font-bold">₹{item.price}</div>
                                    <select
                                        className="border rounded p-1"
                                        value={item.qty}
                                        onChange={(e) => addToCart({ ...item, qty: Number(e.target.value) })}
                                    >
                                        {[...Array(10).keys()].map((x) => (
                                            <option key={x + 1} value={x + 1}>
                                                {x + 1}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => removeFromCart(item.product)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white p-6 rounded shadow-sm h-fit">
                        <h2 className="text-xl font-bold mb-4">
                            Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)}) items
                        </h2>
                        <div className="text-2xl font-bold text-gray-800 mb-1">
                            ₹{cartItems
                                .reduce((acc, item) => acc + item.qty * item.price, 0)
                                .toFixed(2)}
                        </div>
                        <p className="text-xs text-gray-400 font-medium mb-6 italic">MRP is inclusive of all taxes</p>
                        <button
                            onClick={checkoutHandler}
                            disabled={cartItems.length === 0}
                            className="w-full bg-indigo-600 text-white py-3 rounded font-bold hover:bg-indigo-700 transition disabled:bg-gray-400"
                        >
                            Proceed To Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartScreen;
