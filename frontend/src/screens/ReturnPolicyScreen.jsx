import React from 'react';

const ReturnPolicyScreen = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-black text-gray-900 mb-8 border-l-8 border-indigo-600 pl-4">Return & Refund Policy</h1>

            <div className="space-y-8">
                <section className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100">
                    <h2 className="text-2xl font-bold text-indigo-900 mb-4">7-Day Easy Returns</h2>
                    <p className="text-indigo-800 font-medium">
                        We offer a hassle-free 7-day return policy for all our customers.
                        If you are not satisfied with your purchase, you can request a return via your order history.
                    </p>
                </section>

                <div className="prose prose-indigo max-w-none text-gray-700 space-y-6">
                    <h3 className="text-xl font-bold text-gray-900">Eligibility for Returns</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>The item must be unused, unwashed, and in its original packaging.</li>
                        <li>Tags and labels must be intact.</li>
                        <li>The request must be initiated within 7 days of delivery.</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 pt-4">Return Process</h3>
                    <ol className="list-decimal pl-6 space-y-2">
                        <li>Go to <strong>My Orders</strong> in your profile.</li>
                        <li>Select the order you wish to return.</li>
                        <li>Click <strong>Return Order Items</strong>.</li>
                        <li>Provide a reason and submit your request.</li>
                    </ol>

                    <h3 className="text-xl font-bold text-gray-900 pt-4">Refunds</h3>
                    <p>
                        Once your return is picked up and inspected, your refund will be processed to the original payment method within 5-7 business days.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 pt-4">Non-Returnable Items</h3>
                    <p>
                        For hygiene reasons, certain items like towels that have been removed from original packaging cannot be returned unless they have manufacturing defects.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReturnPolicyScreen;
