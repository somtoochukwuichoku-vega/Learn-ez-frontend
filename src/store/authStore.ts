import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import api from '@/lib/api';
import {User} from '@/types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isInitialized: boolean;
    isLoading: boolean;
    isInitializing: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    fetchProfile: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    checkAuth: () => void;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isInitialized: false,
            isLoading: false,
            isInitializing: false,

            initialize: async () => {
                // Prevent multiple concurrent initializations
                if (get().isInitializing || get().isInitialized) {
                    return;
                }

                set({isInitializing: true});

                const token = localStorage.getItem('access_token');
                if (token) {
                    try {
                        const response = await api.get('/auth/profile/');
                        set({user: response.data, isAuthenticated: true, isInitialized: true, isInitializing: false});
                    } catch (error) {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        set({user: null, isAuthenticated: false, isInitialized: true, isInitializing: false});
                    }
                } else {
                    set({isAuthenticated: false, isInitialized: true, isInitializing: false});
                }
            },

            checkAuth: () => {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    set({user: null, isAuthenticated: false});
                }
            },

            login: async (username: string, password: string) => {
                set({isLoading: true});
                try {
                    const response = await api.post('/auth/login/', {username, password});
                    const {access, refresh} = response.data;

                    localStorage.setItem('access_token', access);
                    localStorage.setItem('refresh_token', refresh);

                    const profileResponse = await api.get('/auth/profile/');

                    set({
                        user: profileResponse.data,
                        isAuthenticated: true,
                        isInitialized: true,
                        isLoading: false,
                    });
                } catch (error) {
                    set({isLoading: false});
                    throw error;
                }
            },

            register: async (username: string, email: string, password: string) => {
                set({isLoading: true});
                try {
                    await api.post('/auth/register/', {username, email, password});
                    set({isLoading: false});
                } catch (error) {
                    set({isLoading: false});
                    throw error;
                }
            },

            logout: () => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                set({user: null, isAuthenticated: false});
            },

            fetchProfile: async () => {
                try {
                    const response = await api.get('/auth/profile/');
                    set({user: response.data, isAuthenticated: true});
                } catch (error) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    set({user: null, isAuthenticated: false});
                }
            },

            updateProfile: async (data: Partial<User>) => {
                try {
                    const formData = new FormData();
                    Object.entries(data).forEach(([key, value]) => {
                        if (value !== undefined && value !== null) {
                            formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
                        }
                    });

                    const response = await api.patch('/auth/profile/', formData, {
                        headers: {'Content-Type': 'multipart/form-data'},
                    });
                    set({user: response.data});
                } catch (error) {
                    throw error;
                }
            },
        }),
        {
            name: 'auth-storage',
        },
    ),
);
