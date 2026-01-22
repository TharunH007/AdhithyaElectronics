import { Star, StarHalf } from 'lucide-react';

const Rating = ({ value, text, color = '#f8e825' }) => {
    return (
        <div className="flex items-center gap-1">
            <span className="flex">
                {[1, 2, 3, 4, 5].map((index) => (
                    <span key={index}>
                        {value >= index ? (
                            <Star size={16} fill={color} stroke={color} />
                        ) : value >= index - 0.5 ? (
                            <StarHalf size={16} fill={color} stroke={color} />
                        ) : (
                            <Star size={16} stroke={color} />
                        )}
                    </span>
                ))}
            </span>
            <span className="text-sm text-gray-500 ml-1">{text && text}</span>
        </div>
    );
};

export default Rating;
