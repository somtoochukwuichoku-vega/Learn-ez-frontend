﻿'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useAuthStore} from '@/store/authStore';
import {useTheme} from '@/components/ThemeProvider';
import {BookOpen, Users, Award, Sparkles, Zap, Moon, Sun, GraduationCap, TrendingUp} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
    const router = useRouter();
    const {isAuthenticated, isInitialized} = useAuthStore();
    const {theme, toggleTheme} = useTheme();

    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, isInitialized, router]);

    return (
        <div className='min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-primary-50/30 to-secondary-50/30 dark:from-gray-950 dark:via-primary-950/20 dark:to-secondary-950/20'>
            <div className='absolute top-20 left-10 w-96 h-96 bg-primary-400/20 dark:bg-primary-600/10 rounded-full blur-3xl animate-float'></div>
            <div
                className='absolute bottom-20 right-10 w-[500px] h-[500px] bg-secondary-400/20 dark:bg-secondary-600/10 rounded-full blur-3xl animate-float'
                style={{animationDelay: '2s'}}
            ></div>
            <div
                className='absolute top-1/2 left-1/2 w-80 h-80 bg-accent-400/15 dark:bg-accent-600/8 rounded-full blur-3xl animate-float'
                style={{animationDelay: '4s'}}
            ></div>

            <nav className='glass sticky top-0 z-50 border-b'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex justify-between h-16 items-center'>
                        <Link
                            href='/'
                            className='flex items-center group'
                        >
                            <div className='relative'>
                                <div className='absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl blur-lg opacity-60 group-hover:opacity-90 transition-opacity'></div>
                                <div className='relative bg-gradient-to-r from-primary-600 to-secondary-600 p-2.5 rounded-xl shadow-lg'>
                                    <GraduationCap className='h-6 w-6 text-white' />
                                </div>
                            </div>
                            <span className='ml-3 text-2xl font-bold text-gradient'>Learn-EZ</span>
                        </Link>
                        <div className='flex gap-3'>
                            <button
                                onClick={toggleTheme}
                                className='p-2.5 rounded-xl glass hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300'
                            >
                                {theme === 'light' ? <Moon className='h-5 w-5' /> : <Sun className='h-5 w-5' />}
                            </button>
                            <Link
                                href='/login'
                                className='px-6 py-2 rounded-xl glass hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 font-semibold'
                            >
                                Login
                            </Link>
                            <Link
                                href='/register'
                                className='btn-primary flex items-center gap-2'
                            >
                                <Sparkles className='h-5 w-5' />
                                <span>Get Started</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
                <div className='text-center'>
                    <div className='inline-flex items-center gap-2 glass px-5 py-2.5 rounded-full mb-8 animate-float'>
                        <Sparkles className='h-4 w-4 text-primary-600 dark:text-primary-400' />
                        <span className='text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400'>Transform Your Future</span>
                    </div>

                    <h1 className='text-6xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight leading-none'>
                        Learn Without <br />
                        <span className='text-gradient'>Limits</span>
                    </h1>

                    <p className='text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed'>
                        Experience the future of education with our cutting-edge learning platform. Master new skills, earn certifications, and unlock
                        your potential.
                    </p>

                    <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
                        <Link
                            href='/register'
                            className='btn-primary px-8 py-4 text-base font-bold w-full sm:w-auto flex items-center justify-center gap-3 group'
                        >
                            <Zap className='h-5 w-5 group-hover:scale-125 transition-transform' />
                            Start Learning Free
                        </Link>
                        <Link
                            href='/courses'
                            className='btn-secondary px-8 py-4 text-base font-bold w-full sm:w-auto flex items-center justify-center gap-3'
                        >
                            Explore Courses
                        </Link>
                    </div>
                </div>

                <div className='mt-32 grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
                    {[
                        {
                            icon: BookOpen,
                            title: 'Expert Content',
                            desc: 'Premium courses by industry professionals',
                            gradient: 'from-primary-500 to-primary-600',
                        },
                        {icon: Users, title: 'Community', desc: 'Connect with learners worldwide', gradient: 'from-secondary-500 to-secondary-600'},
                        {icon: Award, title: 'Certifications', desc: 'Earn recognized certificates', gradient: 'from-accent-500 to-accent-600'},
                        {
                            icon: TrendingUp,
                            title: 'Track Progress',
                            desc: 'Monitor your learning journey',
                            gradient: 'from-primary-500 to-accent-600',
                        },
                    ].map((feature, i) => (
                        <div
                            key={i}
                            className='glass-card group'
                        >
                            <div
                                className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}
                            >
                                <feature.icon className='h-7 w-7 text-white' />
                            </div>
                            <h3 className='text-xl font-bold mb-3 text-gray-900 dark:text-white'>{feature.title}</h3>
                            <p className='text-sm text-gray-600 dark:text-gray-400 leading-relaxed'>{feature.desc}</p>
                        </div>
                    ))}
                </div>

                <div className='mt-32 glass-card p-12 relative overflow-hidden'>
                    <div className='absolute -top-24 -left-24 w-96 h-96 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[120px]'></div>
                    <div className='grid md:grid-cols-3 gap-12 text-center relative z-10'>
                        {[
                            {value: '50K+', label: 'Active Students'},
                            {value: '1,200+', label: 'Quality Courses'},
                            {value: '98%', label: 'Satisfaction Rate'},
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className='space-y-3'
                            >
                                <div className='text-5xl md:text-6xl font-black text-gradient'>{stat.value}</div>
                                <div className='text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
