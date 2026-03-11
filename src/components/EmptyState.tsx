'use client';

import {LucideIcon} from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
}

export default function EmptyState({icon: Icon, title, description, actionLabel, actionHref, onAction}: EmptyStateProps) {
    return (
        <div className='flex flex-col items-center justify-center py-16 px-4 text-center'>
            <div className='relative mb-6'>
                <div className='absolute inset-0 bg-primary-500/20 blur-2xl rounded-full' />
                <div className='relative w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center'>
                    <Icon className='w-10 h-10 text-primary-600 dark:text-primary-400' />
                </div>
            </div>
            <h3 className='text-xl font-bold text-slate-900 dark:text-white mb-2'>{title}</h3>
            <p className='text-slate-600 dark:text-slate-400 max-w-md mb-6'>{description}</p>
            {(actionLabel && (actionHref || onAction)) && (
                <>
                    {actionHref ? (
                        <Link
                            href={actionHref}
                            className='btn-primary'
                        >
                            {actionLabel}
                        </Link>
                    ) : (
                        <button
                            onClick={onAction}
                            className='btn-primary'
                        >
                            {actionLabel}
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
