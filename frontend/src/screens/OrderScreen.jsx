import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../utils/api';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { Package, Truck, CreditCard, ChevronLeft, FileText } from 'lucide-react';

const OrderScreen = () => {
    const { id } = useParams();
    const { userInfo } = useAuthStore();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadingDeliver, setLoadingDeliver] = useState(false);
    const [loadingShipped, setLoadingShipped] = useState(false);
    const [loadingReturn, setLoadingReturn] = useState(false);
    const [loadingInvoice, setLoadingInvoice] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnReason, setReturnReason] = useState('');
    const [returnType, setReturnType] = useState('Return'); // 'Return' or 'Replace'

    const fetchOrder = async () => {
        try {
            const { data } = await api.get(`/api/orders/${id}`);
            setOrder(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const shippedHandler = async () => {
        setLoadingShipped(true);
        try {
            const { data } = await api.put(`/api/orders/${id}/shipped`);
            setOrder(data);
            setLoadingShipped(false);
        } catch (err) {
            alert(err.response?.data?.message || err.message);
            setLoadingShipped(false);
        }
    };

    const deliverHandler = async () => {
        setLoadingDeliver(true);
        try {
            const { data } = await api.put(`/api/orders/${id}/deliver`);
            setOrder(data);
            setLoadingDeliver(false);
        } catch (err) {
            alert(err.response?.data?.message || err.message);
            setLoadingDeliver(false);
        }
    };

    const returnHandler = async () => {
        if (!returnReason) {
            alert('Please provide a reason for return');
            return;
        }

        setLoadingReturn(true);
        try {
            await api.post(`/api/returns`, {
                orderId: id,
                reason: returnReason,
                type: returnType
            });
            await fetchOrder();
            setLoadingReturn(false);
            setShowReturnModal(false);
        } catch (err) {
            alert(err.response?.data?.message || err.message);
            setLoadingReturn(false);
        }
    };

    const downloadInvoiceHandler = async () => {
        setLoadingInvoice(true);
        try {
            const response = await api.get(`/api/orders/${id}/invoice`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setLoadingInvoice(false);
        } catch (err) {
            alert(err.response?.data?.message || err.message);
            setLoadingInvoice(false);
        }
    };

    const canReturn = () => {
        if (!order || !order.isDelivered || order.returnRequest?.isReturned || userInfo?.isAdmin) return false;

        const deliveredAt = new Date(order.deliveredAt);
        const now = new Date();
        const diffTime = Math.abs(now - deliveredAt);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        return diffDays <= 7;
    };

    if (loading) return <Loader />;
    if (error) return <Message variant="danger">{error}</Message>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <Link to={userInfo?.isAdmin ? "/admin/orderlist" : "/profile"} className="flex items-center gap-2 text-indigo-600 font-bold hover:underline mb-6">
                <ChevronLeft size={18} />
                Back to {userInfo?.isAdmin ? "Orders" : "Profile"}
            </Link>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/3 space-y-6">
                    <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order Details</h1>
                            <p className="font-mono text-xs text-gray-400 mt-1 uppercase">ID: {order._id}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ring-1 ${order.isDelivered ? 'bg-green-100 text-green-700 ring-green-200' :
                                order.status === 'Shipped' ? 'bg-indigo-100 text-indigo-700 ring-indigo-200' :
                                    'bg-amber-100 text-amber-700 ring-amber-200'
                                }`}>
                                {order.isDelivered ? 'Delivered' : order.status === 'Shipped' ? 'Shipped' : 'Processing'}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ring-1 ${order.isPaid ? 'bg-blue-100 text-blue-700 ring-blue-200' : 'bg-red-100 text-red-700 ring-red-200'
                                }`}>
                                {order.isPaid ? 'Payment Successful' : 'Payment Failed'}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                                <Truck size={20} />
                            </div>
                            <h2 className="text-lg font-bold">Shipping Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <p className="text-gray-400 font-bold uppercase text-[10px]">Customer</p>
                                <p className="font-medium text-gray-800">{order.user.name}</p>
                                <p className="text-gray-500">{order.user.email}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-gray-400 font-bold uppercase text-[10px]">Delivery Address</p>
                                <p className="text-gray-700 leading-relaxed">
                                    {order.shippingAddress.address}, {order.shippingAddress.city}<br />
                                    {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-green-50 p-2 rounded-lg text-green-600">
                                <CreditCard size={20} />
                            </div>
                            <h2 className="text-lg font-bold">Payment</h2>
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Method: <span className="uppercase">{order.paymentMethod}</span></p>
                        {order.isPaid ? (
                            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm font-medium border border-green-100">
                                Paid on {new Date(order.paidAt).toLocaleDateString()}
                            </div>
                        ) : (
                            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium border border-red-100">
                                Awaiting Payment
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-amber-50 p-2 rounded-lg text-amber-600">
                                <Package size={20} />
                            </div>
                            <h2 className="text-lg font-bold">Order Items</h2>
                        </div>
                        <div className="space-y-4">
                            {order.orderItems.map((item, index) => (
                                <div key={index} className="flex gap-4 items-center group">
                                    <div className="h-16 w-16 flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="h-full w-full object-cover rounded-xl shadow-sm group-hover:shadow-md transition-shadow" />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <Link to={`/product/${item.product}`} className="font-bold text-gray-800 hover:text-indigo-600 transition-colors block truncate">
                                            {item.name}
                                        </Link>
                                        <p className="text-xs text-gray-500 font-medium">Quantity: {item.qty}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">₹{(item.qty * item.price).toLocaleString('en-IN')}</p>
                                        <p className="text-[10px] text-gray-400">@ ₹{item.price.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:w-1/3">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Subtotal (Excl. Tax)</span>
                                <span className="font-bold text-gray-900 underline decoration-indigo-100 decoration-4 underline-offset-4">₹{(order.totalPrice - order.taxPrice - order.shippingPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span className="font-medium">GST (Included)</span>
                                <span className="font-bold underline decoration-indigo-100 decoration-4 underline-offset-4">₹{order.taxPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Shipping Fee</span>
                                <span className="font-bold text-gray-900 underline decoration-indigo-100 decoration-4 underline-offset-4">₹{order.shippingPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="pt-4 border-t border-gray-100 flex justify-between">
                                <span className="text-lg font-black text-gray-900 uppercase tracking-tighter">Grand Total</span>
                                <span className="text-2xl font-black text-indigo-600 tracking-tight">₹{order.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>

                            {order.isPaid && (
                                <div className="pt-4">
                                    <button
                                        onClick={downloadInvoiceHandler}
                                        disabled={loadingInvoice}
                                        className="w-full border-2 border-indigo-600 text-indigo-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {loadingInvoice ? <Loader size="sm" /> : <FileText size={20} />}
                                        Download Invoice
                                    </button>
                                </div>
                            )}

                            {userInfo?.isAdmin && order.isPaid && !order.isDelivered && (
                                <div className="pt-6 space-y-3">
                                    {order.status !== 'Shipped' && (
                                        <button
                                            onClick={shippedHandler}
                                            disabled={loadingShipped}
                                            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {loadingShipped ? <Loader size="sm" /> : <Truck size={20} />}
                                            Mark as Shipped
                                        </button>
                                    )}
                                    <button
                                        onClick={deliverHandler}
                                        disabled={loadingDeliver}
                                        className="w-full bg-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-100 active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {loadingDeliver ? <Loader size="sm" /> : <Package size={20} />}
                                        Mark as Delivered
                                    </button>
                                </div>
                            )}

                            {canReturn() && (
                                <div className="pt-6">
                                    <button
                                        onClick={() => setShowReturnModal(true)}
                                        className="w-full bg-amber-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-600 transition-all shadow-lg shadow-amber-100 active:scale-[0.98]"
                                    >
                                        <Truck size={20} />
                                        Return Order Items
                                    </button>
                                </div>
                            )}

                            {order.returnRequest?.isReturned && (
                                <div className="mt-6 bg-amber-50 border border-amber-200 p-4 rounded-xl">
                                    <p className="text-amber-800 font-bold text-sm">
                                        {order.returnRequest.type} Requested
                                    </p>
                                    <p className="text-amber-600 text-xs mt-1">
                                        Status: {order.returnRequest.status}
                                    </p>
                                    <p className="text-gray-500 text-xs mt-2 italic">
                                        "{order.returnRequest.reason}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Return Modal */}
            {showReturnModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl scale-in-center">
                        <h2 className="text-2xl font-black text-gray-900 mb-6">Request Return</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Reason</label>
                                <textarea
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                    placeholder="Tell us why you want to return this order..."
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                    rows="4"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowReturnModal(false)}
                                className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={returnHandler}
                                disabled={loadingReturn}
                                className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                            >
                                {loadingReturn ? <Loader size="sm" /> : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderScreen;
