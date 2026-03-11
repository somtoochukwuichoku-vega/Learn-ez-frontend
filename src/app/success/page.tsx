'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import {CheckCircle, Sparkles, ArrowRight, BookOpen} from 'lucide-react';

export default function SuccessPage() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push('/dashboard');
        }, 8000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <AppLayout>
            <div className='flex flex-col items-center justify-center min-h-[70vh]'>
                <div className='glass-card max-w-2xl w-full p-16 text-center border border-emerald-500/20 card-glow relative overflow-hidden'>
                    {/* Background Sparkles */}
                    <div className='absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent'></div>
                    <div className='absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl'></div>
                    
                    <div className='relative z-10'>
                        <div className='w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-xl shadow-emerald-500/30 animate-bounce-slow'>
                            <CheckCircle className='h-12 w-12 text-white' />
                        </div>

                        <div className='inline-flex items-center gap-2 glass !bg-emerald-500/10 px-4 py-2 rounded-full mb-6 border border-emerald-500/20'>
                            <Sparkles className='h-4 w-4 text-emerald-500' />
                            <span className='text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400'>Enrollment Complete</span>
                        </div>

                        <h1 className='text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight'>Payment <span className='text-gradient !from-emerald-500 !to-teal-600'>Successful!</span></h1>
                        <p className='text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed mb-12 max-w-md mx-auto'>
                            Welcome aboard! Your course is now unlocked. Get ready to embark on your learning journey.
                        </p>

                        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className='btn-primary !from-emerald-600 !to-teal-600 shadow-emerald-500/20 px-10 py-4 flex items-center justify-center gap-2'
                            >
                                <BookOpen className='h-5 w-5' />
                                Start Learning
                                <ArrowRight className='h-4 w-4 opacity-50' />
                            </button>
                        </div>

                        <p className='text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-12 animate-pulse'>
                            Redirecting to dashboard in a moment...
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
