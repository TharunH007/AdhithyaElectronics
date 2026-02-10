import React from 'react';

const AboutScreen = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-black text-gray-900 mb-8 border-b-4 border-indigo-600 pb-2 inline-block">About NKM Trading Company</h1>

            <div className="prose prose-indigo max-w-none space-y-6 text-gray-700 leading-relaxed">
                <p className="text-xl font-medium text-gray-800">
                    Welcome to NKM Trading Company, your premier destination for high-quality home textiles and premium fabrics.
                </p>

                <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100 italic font-serif">
                    "Our mission is to bring comfort and elegance to every Indian home with the finest linens and textiles."
                </div>

                <h2 className="text-2xl font-bold text-gray-900 pt-4">Who We Are</h2>
                <p>
                    Established with a passion for excellence, NKM Trading Company has been a trusted partner for Bombay Dyeing products.
                    We specialize in bringing the luxury of premium bed linen, towels, and home decor directly to your doorstep.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 pt-4">Why Choose Us?</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Authentic Products:</strong> We source directly to ensure you get genuine Bombay Dyeing quality.</li>
                    <li><strong>Curated Collection:</strong> Every item in our store is selected for its comfort, durability, and style.</li>
                    <li><strong>Customer First:</strong> We believe in a seamless shopping experience backed by reliable support.</li>
                    <li><strong>Fast Delivery:</strong> Efficient shipping across Chennai and beyond.</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 pt-4">Our Commitment</h2>
                <p>
                    From the threads of our fabrics to the promptness of our delivery, quality is woven into everything we do.
                    Whether you're looking to refresh your bedroom with vibrant prints or searching for the softest towels,
                    NKM Trading Company is here to help you create a beautiful home.
                </p>
            </div>
        </div>
    );
};

export default AboutScreen;
