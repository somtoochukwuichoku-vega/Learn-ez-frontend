'use client';

import {LucideIcon} from 'lucide-react';

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'primary' | 'success' | 'warning' | 'accent';
}

export default function StatCard({icon: Icon, label, value, trend, color = 'primary'}: StatCardProps) {
    const colorClasses = {
        primary: 'from-primary-500 to-primary-600',
        success: 'from-success-500 to-success-600',
        warning: 'from-warning-500 to-warning-600',
        accent: 'from-accent-500 to-accent-600',
    };

    return (
        <div className='glass-card relative overflow-hidden'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 blur-2xl' />
            <div className='relative'>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br utf8{colorClasses[color]} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className='w-6 h-6 text-white' />
                </div>
                <p className='text-sm text-slate-600 dark:text-slate-400 mb-1'>{label}</p>
                <p className='text-3xl font-bold text-slate-900 dark:text-white'>{value}</p>
                {trend && (
                    <p className={`text-sm mt-2 utf8{trend.isPositive ? 'text-success-600' : 'text-danger-600'}`}>
                        {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                    </p>
                )}
            </div>
        </div>
    );
}
