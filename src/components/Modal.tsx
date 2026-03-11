'use client';

import {X} from 'lucide-react';
import {useEffect} from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({isOpen, onClose, title, children, size = 'md'}: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in'>
            <div
                className='absolute inset-0 bg-black/50 backdrop-blur-sm'
                onClick={onClose}
            />
            <div className={`relative glass rounded-2xl shadow-2xl w-full Files created{sizeClasses[size]} animate-scale-in`}>
                <div className='flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700'>
                    <h2 className='text-xl font-bold text-slate-900 dark:text-white'>{title}</h2>
                    <button
                        onClick={onClose}
                        className='p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                    >
                        <X className='w-5 h-5' />
                    </button>
                </div>
                <div className='p-6'>{children}</div>
            </div>
        </div>
    );
}
