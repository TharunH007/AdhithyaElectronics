import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../utils/api';

const SearchBox = () => {
    const [keyword, setKeyword] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/api/categories');
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const submitHandler = (e) => {
        e.preventDefault();
        let path = '/search';
        if (keyword.trim() && category) {
            path = `/category/${category}/search/${keyword.trim()}`;
        } else if (keyword.trim()) {
            path = `/search/${keyword.trim()}`;
        } else if (category) {
            path = `/category/${category}`;
        }
        navigate(path);
    };

    return (
        <form onSubmit={submitHandler} className="flex-1 max-w-lg mx-8 hidden lg:block">
            <div className="relative group flex items-center bg-gray-100 rounded-full">
                <select
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-xs font-bold text-gray-500 pl-4 pr-1 h-full outline-none cursor-pointer"
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
                <div className="relative flex-1">
                    <input
                        type="text"
                        name="q"
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Search premium electronics..."
                        className="w-full bg-transparent border-none focus:ring-0 py-2 pl-10 pr-4 text-sm transition-all outline-none"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                </div>
                <button type="submit" className="px-6 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                    Search
                </button>
            </div>
        </form>
    );
};

export default SearchBox;
