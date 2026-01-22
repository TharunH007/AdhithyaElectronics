import { Link } from 'react-router-dom';
import Rating from './Rating';

const Product = ({ product }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
            <Link to={`/product/${product._id}`}>
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover object-center"
                />
            </Link>
            <div className="p-4 flex flex-col flex-grow">
                <Link to={`/product/${product._id}`}>
                    <h3 className="text-lg font-medium text-gray-900 mb-2 truncate">
                        {product.name}
                    </h3>
                </Link>
                <div className="flex items-center mb-1">
                    <Rating value={product.rating} text={`${product.numReviews} reviews`} />
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-xl font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
                    {product.mrp > product.price && (
                        <span className="text-sm text-gray-400 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
                    )}
                    {product.mrp > product.price && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                        </span>
                    )}
                </div>
                <div className="mt-auto flex justify-between items-center pt-3 border-t border-gray-50">
                    <span className={`text-[11px] font-bold uppercase tracking-widest ${product.countInStock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <Link to={`/product/${product._id}`} className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                        Details
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Product;
