import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set) => ({
            userInfo: null,
            setUserInfo: (data) => set({ userInfo: data }),
            logout: () => set({ userInfo: null }),
        }),
        {
            name: 'auth-storage',
        }
    )
);

export default useAuthStore;
