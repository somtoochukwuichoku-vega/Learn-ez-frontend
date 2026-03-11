'use client';

import {useEffect, useRef} from 'react';
import {useAuthStore} from '@/store/authStore';
import Sidebar from './Sidebar';

export default function AppLayout({children}: {children: React.ReactNode}) {
    const initialize = useAuthStore((state) => state.initialize);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            initialize();
        }
    }, []);

    return (
        <div className='flex min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-500'>
            <Sidebar />
            <main className='flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 min-h-screen relative overflow-hidden transition-all duration-300'>
                {/* Glassmorphism background effects */}
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(12,19,79,0.03),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(12,19,79,0.2),transparent_50%)] pointer-events-none'></div>
                <div className='absolute top-0 right-0 w-96 h-96 bg-primary-900/5 dark:bg-primary-900/10 rounded-full blur-3xl pointer-events-none'></div>
                <div className='absolute bottom-0 left-0 w-96 h-96 bg-secondary-600/5 dark:bg-secondary-600/10 rounded-full blur-3xl pointer-events-none'></div>
                <div className='relative z-10 max-w-7xl mx-auto'>{children}</div>
            </main>
        </div>
    );
}
