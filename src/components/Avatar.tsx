'use client';

import {User} from 'lucide-react';
import Image from 'next/image';

interface AvatarProps {
    src?: string | null;
    alt?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    fallback?: string;
    className?: string;
    seed?: string;
}

const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-2xl',
};

export default function Avatar({src, alt = 'Avatar', size = 'md', fallback, className = '', seed}: AvatarProps) {
    const sizeClass = sizeClasses[size];
    const avatarUrl = src || (seed ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}` : null);

    if (avatarUrl) {
        return (
            <div className={`relative ${sizeClass} rounded-full overflow-hidden ring-2 ring-white/50 dark:ring-slate-700/50 shadow-lg ${className}`}>
                <Image
                    src={avatarUrl}
                    alt={alt}
                    fill
                    className='object-cover'
                    unoptimized={avatarUrl.includes('dicebear.com')}
                />
            </div>
        );
    }

    return (
        <div
            className={`${sizeClass} rounded-full bg-primary-900 dark:bg-primary-800 flex items-center justify-center text-white font-medium ring-2 ring-white/50 dark:ring-slate-700/50 shadow-lg ${className}`}
        >
            {fallback ? <span>{fallback.charAt(0).toUpperCase()}</span> : <User className='w-1/2 h-1/2' />}
        </div>
    );
}
