'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {useAuthStore} from '@/store/authStore';
import toast from 'react-hot-toast';
import {BookOpen, Mail, Lock, User, Sparkles} from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const {register, isLoading} = useAuthStore();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            await register(formData.username, formData.email, formData.password);
            toast.success('Account created! Please login.');
            router.push('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Registration failed');
        }
    };

    return (
        <div className='min-h-screen relative overflow-hidden flex items-center justify-center p-6'>
            {/* Animated Background */}
            <div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950'></div>

            {/* Floating Orbs */}
            <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-[120px] pointer-events-none'></div>
            <div className='absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none'></div>

            <div className='max-w-md w-full relative z-10'>
                <div className='text-center mb-10'>
                    <Link href='/' className='inline-flex justify-center mb-6 group transition-transform hover:scale-110'>
                        <div className='relative'>
                            <div className='absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity'></div>
                            <div className='relative bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-xl shadow-blue-500/20'>
                                <BookOpen className='h-8 w-8 text-white' />
                            </div>
                        </div>
                    </Link>
                    <h1 className='text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight'>Create <span className='text-gradient'>Account</span></h1>
                    <p className='text-slate-500 dark:text-slate-400 font-medium'>Start your learning journey today</p>
                </div>

                <div className='glass-card p-10 border border-white/20 dark:border-white/5 card-glow'>
                    <form
                        onSubmit={handleSubmit}
                        className='space-y-5'
                    >
                        <div>
                            <label className='block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1'>Username</label>
                            <div className='relative group'>
                                <User className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors' />
                                <input
                                    type='text'
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    className='w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium'
                                    placeholder='Choose a username'
                                />
                            </div>
                        </div>

                        <div>
                            <label className='block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1'>Email</label>
                            <div className='relative group'>
                                <Mail className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors' />
                                <input
                                    type='email'
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className='w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium'
                                    placeholder='Enter your email'
                                />
                            </div>
                        </div>

                        <div>
                            <label className='block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1'>Password</label>
                            <div className='relative group'>
                                <Lock className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors' />
                                <input
                                    type='password'
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className='w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium'
                                    placeholder='Create a password'
                                />
                            </div>
                        </div>

                        <div>
                            <label className='block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1'>Confirm Password</label>
                            <div className='relative group'>
                                <Lock className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors' />
                                <input
                                    type='password'
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                    className='w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium'
                                    placeholder='Confirm your password'
                                />
                            </div>
                        </div>

                        <button
                            type='submit'
                            disabled={isLoading}
                            className='w-full btn-primary !py-4 flex items-center justify-center gap-2 group text-sm font-black uppercase tracking-widest'
                        >
                            {isLoading ? (
                                <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                            ) : (
                                <>
                                    Create Account
                                    <Sparkles className='h-4 w-4 group-hover:scale-125 transition-transform' />
                                </>
                            )}
                        </button>
                    </form>

                    <div className='mt-8 text-center'>
                        <p className='text-sm text-slate-500 dark:text-slate-400 font-medium'>
                            Already have an account?{' '}
                            <Link
                                href='/login'
                                className='text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest text-xs hover:text-blue-700 underline underline-offset-4 decoration-2 decoration-blue-500/20'
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
