import React from 'react';

const TermsScreen = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-black text-gray-900 mb-8 uppercase tracking-tighter">Terms and Conditions</h1>

            <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">1. Acceptance of Terms</h2>
                    <p>By accessing and using this website, you agree to comply with and be bound by these Terms and Conditions.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">2. Product Information</h2>
                    <p>We strive for accuracy, but we do not warrant that product descriptions or colors on the site are 100% accurate, complete, or error-free. Slight variations in fabric color may occur due to photography lighting.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">3. Pricing and Payment</h2>
                    <p>All prices are in Indian Rupees (INR) and are inclusive of applicable taxes. We reserve the right to change prices without notice.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">4. Intellectual Property</h2>
                    <p>All content on this site, including logos, text, and images, is the property of NKM Trading Company or its suppliers and is protected by copyright laws.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">5. Limitation of Liability</h2>
                    <p>NKM Trading Company shall not be liable for any indirect, incidental, or consequential damages arising out of the use of our products.</p>
                </section>
            </div>
        </div>
    );
};

export default TermsScreen;
