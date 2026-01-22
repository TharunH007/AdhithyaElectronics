import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

const useCartStore = create(
    persist(
        (set, get) => ({
            cartItems: [],
            shippingAddress: {},
            paymentMethod: 'Razorpay',

            addToCart: async (item) => {
                const cartItems = get().cartItems;
                const existItem = cartItems.find((x) => x.product === item.product);
                let newItems;

                if (existItem) {
                    newItems = cartItems.map((x) =>
                        x.product === existItem.product ? item : x
                    );
                } else {
                    newItems = [...cartItems, item];
                }

                set({ cartItems: newItems });

                // Sync to DB if logged in
                const authStorage = localStorage.getItem('auth-storage');
                if (authStorage) {
                    const { state } = JSON.parse(authStorage);
                    if (state && state.userInfo) {
                        try {
                            await api.post('/api/cart', { cartItems: newItems });
                        } catch (err) {
                            console.error('Failed to sync cart to DB', err);
                        }
                    }
                }
            },

            removeFromCart: async (id) => {
                const newItems = get().cartItems.filter((x) => x.product !== id);
                set({ cartItems: newItems });

                // Sync to DB if logged in
                const authStorage = localStorage.getItem('auth-storage');
                if (authStorage) {
                    const { state } = JSON.parse(authStorage);
                    if (state && state.userInfo) {
                        try {
                            await api.post('/api/cart', { cartItems: newItems });
                        } catch (err) {
                            console.error('Failed to sync cart to DB', err);
                        }
                    }
                }
            },

            setCart: (items) => set({ cartItems: items }),
            saveShippingAddress: (data) => set({ shippingAddress: data }),
            savePaymentMethod: (data) => set({ paymentMethod: data }),
            clearCart: () => set({ cartItems: [], shippingAddress: {}, paymentMethod: 'Razorpay' }),
        }),
        {
            name: 'cart-storage',
        }
    )
);

export default useCartStore;
