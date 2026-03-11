'use client';

import {useRouter} from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import {XCircle, ArrowLeft, Search} from 'lucide-react';

export default function CancelPage() {
    const router = useRouter();

    return (
        <AppLayout>
            <div className='flex flex-col items-center justify-center min-h-[70vh]'>
                <div className='glass-card max-w-2xl w-full p-16 text-center border border-rose-500/20 card-glow relative overflow-hidden'>
                    {/* Background Stripe */}
                    <div className='absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent'></div>
                    
                    <div className='relative z-10'>
                        <div className='w-24 h-24 bg-gradient-to-br from-rose-400 to-red-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-xl shadow-rose-500/30'>
                            <XCircle className='h-12 w-12 text-white' />
                        </div>

                        <h1 className='text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tight'>Payment <span className='text-gradient !from-rose-500 !to-red-600'>Cancelled</span></h1>
                        <p className='text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed mb-12 max-w-md mx-auto'>
                            Your transaction was not completed. No charges have been made to your account.
                        </p>

                        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                            <button
                                onClick={() => router.push('/courses')}
                                className='px-8 py-4 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-black uppercase tracking-widest text-xs flex items-center gap-2'
                            >
                                <Search className='h-4 w-4' />
                                Browse Catalog
                            </button>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className='btn-primary px-8 py-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest'
                            >
                                <ArrowLeft className='h-4 w-4' />
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
