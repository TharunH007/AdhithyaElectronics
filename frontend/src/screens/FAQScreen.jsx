import React from 'react';

const FAQScreen = () => {
    const faqs = [
        {
            q: "How long does shipping take?",
            a: "Orders within Chennai are typically delivered within 24-48 hours. Outside Chennai, it may take 3-5 business days."
        },
        {
            q: "What is your return policy?",
            a: "We offer a 7-day return and replacement policy for all unused items in their original packaging."
        },
        {
            q: "Are the products genuine?",
            a: "Yes, all our Bombay Dyeing products are 100% authentic and sourced directly from authorized channels."
        },
        {
            q: "Can I cancel my order?",
            a: "Orders can be cancelled anytime before they are shipped. Once shipped, the return process must be followed."
        },
        {
            q: "Do you offer bulk discounts?",
            a: "Yes, for wholesale inquiries or bulk corporate orders, please contact us at support@nkmtrading.com."
        }
    ];

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-black text-gray-900 mb-8">Frequently Asked Questions</h1>

            <div className="space-y-6">
                {faqs.map((faq, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-bold text-indigo-600 mb-2">{faq.q}</h3>
                        <p className="text-gray-600">{faq.a}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQScreen;
