'use client';

import {useEffect, useState} from 'react';
import {useRouter, useParams} from 'next/navigation';
import {useAuthStore} from '@/store/authStore';
import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';
import {Course} from '@/types';
import {CreditCard, DollarSign, ShieldCheck, Zap, Sparkles, ChevronRight} from 'lucide-react';
import {formatCurrency} from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
    const router = useRouter();
    const params = useParams();
    const {isAuthenticated, isInitialized} = useAuthStore();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentType, setPaymentType] = useState<'full' | 'installment'>('full');

    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        fetchCourse();
    }, [isAuthenticated, isInitialized, router, params.courseId]);

    const fetchCourse = async () => {
        try {
            const response = await api.get(`/courses/`);
            const courses = response.data.results || response.data || [];
            const foundCourse = courses.find((c: Course) => c.id === params.courseId);

            if (foundCourse) {
                setCourse(foundCourse);
            }
        } catch (error) {
            toast.error('Failed to load course');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = async () => {
        if (!course) return;

        setProcessing(true);
        try {
            const endpoint = paymentType === 'installment' ? `/create-installment-session/${course.id}/` : `/create-checkout-session/${course.id}/`;

            const response = await api.post(endpoint);

            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Payment failed');
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className='flex items-center justify-center h-[60vh]'>
                    <div className='relative'>
                        <div className='w-16 h-16 border-4 border-blue-100 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin'></div>
                        <div className='absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse'></div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (!course) {
        return (
            <AppLayout>
                <div className='glass-card p-16 text-center border-dashed border-2'>
                    <div className='w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6'>
                        <CreditCard className='h-10 w-10 text-slate-300' />
                    </div>
                    <h3 className='text-2xl font-black text-slate-900 dark:text-white mb-2'>Course not found</h3>
                    <p className='text-slate-500 dark:text-slate-400 font-medium'>
                        The course you are looking for does not exist or has been removed.
                    </p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className='mb-10'>
                <div className='inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-4 animate-float'>
                    <ShieldCheck className='h-4 w-4 text-emerald-500' />
                    <span className='text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400'>Secure Checkout</span>
                </div>
                <h1 className='text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight'>
                    Confirm your <span className='text-gradient'>Enrollment</span>
                </h1>
                <p className='text-slate-500 dark:text-slate-400 font-medium'>Review your order and choose your preferred payment method</p>
            </div>

            <div className='grid lg:grid-cols-3 gap-10'>
                <div className='lg:col-span-2 space-y-8'>
                    {/* Course Summary Card */}
                    <div className='glass-card p-8 border border-white/20 dark:border-white/5'>
                        <h2 className='text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6'>Order Details</h2>
                        <div className='flex flex-col md:flex-row gap-8 items-start md:items-center'>
                            <div className='w-32 h-32 rounded-3xl overflow-hidden shadow-lg relative shrink-0'>
                                {course.thumbnail ? (
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className='w-full h-full object-cover'
                                    />
                                ) : (
                                    <div className='w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center'>
                                        <Zap className='h-10 w-10 text-white/30' />
                                    </div>
                                )}
                            </div>
                            <div className='flex-1'>
                                <h3 className='text-2xl font-black text-slate-900 dark:text-white mb-2 leading-tight'>{course.title}</h3>
                                <div className='flex flex-wrap gap-3 mt-4'>
                                    <span className='glass px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 border border-blue-500/10'>
                                        {course.category}
                                    </span>
                                    <span className='glass px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-500/10'>
                                        {course.level}
                                    </span>
                                </div>
                            </div>
                            <div className='text-right'>
                                <p className='text-3xl font-black text-slate-900 dark:text-white tracking-tight'>{formatCurrency(course.price)}</p>
                                <p className='text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1'>Full Amount</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Plans */}
                    {course.allows_installments && (
                        <div className='space-y-6'>
                            <h2 className='text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4'>Choose a Plan</h2>
                            <div className='grid md:grid-cols-2 gap-6'>
                                <div
                                    onClick={() => setPaymentType('full')}
                                    className={`glass-card p-6 border-2 transition-all cursor-pointer ${
                                        paymentType === 'full'
                                            ? 'border-blue-600 ring-4 ring-blue-500/10 shadow-blue-500/5'
                                            : 'border-white/20 dark:border-white/5 hover:border-blue-500/20'
                                    }`}
                                >
                                    <div className='flex items-center justify-between mb-4'>
                                        <div
                                            className={`p-2 rounded-xl ${paymentType === 'full' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}
                                        >
                                            <CreditCard className='h-5 w-5' />
                                        </div>
                                        {paymentType === 'full' && (
                                            <div className='w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center'>
                                                <div className='w-2 h-2 rounded-full bg-white'></div>
                                            </div>
                                        )}
                                    </div>
                                    <h4 className='font-black text-slate-900 dark:text-white tracking-tight uppercase text-xs mb-1'>Pay in Full</h4>
                                    <p className='text-2xl font-black text-blue-600 mb-2'>{formatCurrency(course.price)}</p>
                                    <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>One-time payment</p>
                                </div>

                                <div
                                    onClick={() => setPaymentType('installment')}
                                    className={`glass-card p-6 border-2 transition-all cursor-pointer ${
                                        paymentType === 'installment'
                                            ? 'border-indigo-600 ring-4 ring-indigo-500/10 shadow-indigo-500/5'
                                            : 'border-white/20 dark:border-white/5 hover:border-indigo-500/20'
                                    }`}
                                >
                                    <div className='flex items-center justify-between mb-4'>
                                        <div
                                            className={`p-2 rounded-xl ${paymentType === 'installment' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}
                                        >
                                            <Sparkles className='h-5 w-5' />
                                        </div>
                                        {paymentType === 'installment' && (
                                            <div className='w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center'>
                                                <div className='w-2 h-2 rounded-full bg-white'></div>
                                            </div>
                                        )}
                                    </div>
                                    <h4 className='font-black text-slate-900 dark:text-white tracking-tight uppercase text-xs mb-1'>
                                        Flex Installments
                                    </h4>
                                    <p className='text-2xl font-black text-indigo-600 mb-2'>{formatCurrency(course.installment_amount || 0)}</p>
                                    <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                                        {course.installment_count} × {formatCurrency(course.installment_amount || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Order Summary */}
                <div className='space-y-6'>
                    <div className='glass-card p-8 border border-blue-500/20 bg-blue-500/[0.02] dark:bg-blue-600/[0.01] sticky top-8 card-glow'>
                        <h2 className='text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6'>Order Summary</h2>

                        <div className='space-y-4 mb-8'>
                            <div className='flex justify-between items-center text-sm font-bold'>
                                <span className='text-slate-500 uppercase tracking-widest text-[11px]'>Subtotal</span>
                                <span className='text-slate-900 dark:text-white'>{formatCurrency(course.price)}</span>
                            </div>
                            {paymentType === 'installment' && (
                                <div className='flex justify-between items-center text-sm font-bold'>
                                    <span className='text-slate-500 uppercase tracking-widest text-[11px]'>Payment Plan Bonus</span>
                                    <span className='text-emerald-500 text-[10px] font-black'>FLEXIBLE</span>
                                </div>
                            )}
                            <div className='h-px bg-slate-100 dark:bg-white/10 my-6'></div>
                            <div className='flex justify-between items-start'>
                                <div>
                                    <p className='text-slate-500 uppercase tracking-widest text-[11px] font-black mb-1'>Due Today</p>
                                    <p className='text-sm text-slate-400 font-medium'>
                                        {paymentType === 'full' ? 'Full access granted' : 'First installment'}
                                    </p>
                                </div>
                                <span className='text-3xl font-black text-blue-600 tracking-tight'>
                                    {paymentType === 'installment' ? formatCurrency(course.installment_amount || 0) : formatCurrency(course.price)}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={processing}
                            className='w-full btn-primary !py-5 flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest group'
                        >
                            {processing ? (
                                <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                            ) : (
                                <>
                                    <CreditCard className='h-5 w-5' />
                                    Secure Pay
                                    <ChevronRight className='h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform' />
                                </>
                            )}
                        </button>

                        <div className='mt-8 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400'>
                            <ShieldCheck className='h-4 w-4 text-emerald-500' />
                            SSL Secure Transfer
                        </div>
                    </div>

                    <p className='text-center text-xs text-slate-400 font-medium px-4'>
                        By proceeding, you agree to LearnEZ&apos;s Terms of Service and Privacy Policy. Secure payments processed by Stripe.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
