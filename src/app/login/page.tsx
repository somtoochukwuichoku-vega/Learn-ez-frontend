'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {useAuthStore} from '@/store/authStore';
import toast from 'react-hot-toast';
import {GraduationCap, User, Eye, EyeOff, Zap} from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const {login, isLoading} = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({username: '', password: ''});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(formData.username, formData.password);
            toast.success('Welcome back!');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Login failed');
        }
    };

    return (
        <div className='min-h-screen relative overflow-hidden flex items-center justify-center p-6 bg-gradient-to-br from-white via-primary-50/30 to-secondary-50/30 dark:from-gray-950 dark:via-primary-950/20 dark:to-secondary-950/20'>
            <div className='absolute top-20 left-10 w-96 h-96 bg-primary-400/20 dark:bg-primary-600/10 rounded-full blur-3xl animate-float'></div>
            <div
                className='absolute bottom-20 right-10 w-96 h-96 bg-secondary-400/20 dark:bg-secondary-600/10 rounded-full blur-3xl animate-float'
                style={{animationDelay: '2s'}}
            ></div>

            <div className='max-w-md w-full relative z-10'>
                <div className='text-center mb-10'>
                    <Link
                        href='/'
                        className='inline-flex justify-center mb-6 group'
                    >
                        <div className='relative'>
                            <div className='absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl blur-lg opacity-60 group-hover:opacity-90 transition-opacity'></div>
                            <div className='relative bg-gradient-to-r from-primary-600 to-secondary-600 p-4 rounded-2xl shadow-xl'>
                                <GraduationCap className='h-8 w-8 text-white' />
                            </div>
                        </div>
                    </Link>
                    <h1 className='text-4xl font-black text-gray-900 dark:text-white mb-2'>
                        Welcome <span className='text-gradient'>Back</span>
                    </h1>
                    <p className='text-gray-600 dark:text-gray-400'>Sign in to continue your learning journey</p>
                </div>

                <div className='glass-card p-10'>
                    <form
                        onSubmit={handleSubmit}
                        className='space-y-6'
                    >
                        <div>
                            <label className='block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-3'>Username</label>
                            <div className='relative group'>
                                <User className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors' />
                                <input
                                    type='text'
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    className='input-field pl-12'
                                    placeholder='Enter your username'
                                />
                            </div>
                        </div>

                        <div>
                            <label className='block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-3'>Password</label>
                            <div className='relative group'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className='input-field pr-12'
                                    placeholder='Enter your password'
                                />
                                <button
                                    type='button'
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors'
                                >
                                    {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
                                </button>
                            </div>
                        </div>

                        <button
                            type='submit'
                            disabled={isLoading}
                            className='w-full btn-primary !py-4 flex items-center justify-center gap-2 group'
                        >
                            {isLoading ? (
                                <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                            ) : (
                                <>
                                    <Zap className='h-5 w-5 group-hover:scale-125 transition-transform' />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <div className='mt-8 text-center'>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                            Don&apos;t have an account?{' '}
                            <Link
                                href='/register'
                                className='text-primary-600 dark:text-primary-400 font-bold hover:underline'
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
