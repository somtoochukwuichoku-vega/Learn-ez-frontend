'use client';

import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useAuthStore} from '@/store/authStore';
import {useTheme} from '@/components/ThemeProvider';
import {BookOpen, LogOut, User, Home, BookMarked, FileText, Building2, Moon, Sun, Sparkles} from 'lucide-react';

export default function Navbar() {
    const router = useRouter();
    const {user, logout} = useAuthStore();
    const {theme, toggleTheme} = useTheme();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <nav className='glass sticky top-0 z-50 border-b border-white/20 dark:border-slate-700/50'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex justify-between h-16 items-center'>
                    <div className='flex items-center gap-8'>
                        <Link
                            href='/dashboard'
                            className='flex items-center group'
                        >
                            <div className='relative'>
                                <div className='absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-purple rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity'></div>
                                <div className='relative bg-gradient-to-r from-primary-600 to-accent-purple p-2 rounded-xl'>
                                    <BookOpen className='h-6 w-6 text-white' />
                                </div>
                            </div>
                            <span className='ml-3 text-2xl font-bold text-gradient'>Learn-EZ</span>
                        </Link>

                        <div className='hidden md:flex gap-2'>
                            <Link
                                href='/dashboard'
                                className='flex items-center gap-2 px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300'
                            >
                                <Home className='h-4 w-4' />
                                Dashboard
                            </Link>
                            <Link
                                href='/courses'
                                className='flex items-center gap-2 px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300'
                            >
                                <BookMarked className='h-4 w-4' />
                                Courses
                            </Link>
                            <Link
                                href='/assignments'
                                className='flex items-center gap-2 px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300'
                            >
                                <FileText className='h-4 w-4' />
                                Assignments
                            </Link>
                            <Link
                                href='/organizations'
                                className='flex items-center gap-2 px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300'
                            >
                                <Building2 className='h-4 w-4' />
                                Organizations
                            </Link>
                        </div>
                    </div>

                    <div className='flex items-center gap-3'>
                        <button
                            onClick={toggleTheme}
                            className='p-2 rounded-xl glass hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300'
                            aria-label='Toggle theme'
                        >
                            {theme === 'light' ? (
                                <Moon className='h-5 w-5 text-slate-700 dark:text-slate-300' />
                            ) : (
                                <Sun className='h-5 w-5 text-slate-700 dark:text-slate-300' />
                            )}
                        </button>

                        <Link
                            href='/profile'
                            className='flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300'
                        >
                            <User className='h-5 w-5' />
                            <span className='hidden md:inline text-slate-700 dark:text-slate-300'>{user?.username}</span>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className='flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl'
                        >
                            <LogOut className='h-5 w-5' />
                            <span className='hidden md:inline'>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
