'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAuthStore} from '@/store/authStore';
import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';
import {Assignment} from '@/types';
import {CheckCircle2, Clock, AlertCircle, Calendar, Sparkles} from 'lucide-react';
import toast from 'react-hot-toast';
import {formatDate} from '@/lib/utils';

export default function AssignmentsPage() {
    const router = useRouter();
    const {isAuthenticated, isInitialized} = useAuthStore();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        fetchAssignments();
    }, [isAuthenticated, isInitialized, router]);

    const fetchAssignments = async () => {
        try {
            const response = await api.get('/assignments/');
            setAssignments(response.data.results || response.data || []);
        } catch (error) {
            toast.error('Failed to load assignments');
        } finally {
            setLoading(false);
        }
    };

    const filteredAssignments = assignments.filter((a) => {
        if (filter === 'all') return true;
        return a.status.toLowerCase() === filter;
    });

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

    return (
        <AppLayout>
            <div className='mb-10'>
                <div className='inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-4 animate-float'>
                    <Sparkles className='h-4 w-4 text-accent-purple' />
                    <span className='text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400'>Academic Progress</span>
                </div>
                <h1 className='text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight'>
                    Your <span className='text-gradient'>Assignments</span>
                </h1>
                <p className='text-slate-500 dark:text-slate-400 font-medium'>Track your tasks, deadlines, and submissions across all courses</p>
            </div>

            {/* Status Tabs */}
            <div className='glass p-2 rounded-[1.5rem] inline-flex gap-2 mb-10 border border-white/20 dark:border-white/5 overflow-x-auto max-w-full'>
                {(['all', 'pending', 'submitted', 'graded'] as const).map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                            filter === s
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Assignments Grid */}
            {filteredAssignments.length > 0 ? (
                <div className='grid md:grid-cols-2 gap-6'>
                    {filteredAssignments.map((assignment) => (
                        <div
                            key={assignment.id}
                            className='glass-card group border border-white/20 dark:border-white/5 card-glow p-8 cursor-pointer'
                            onClick={() => router.push(`/assignments/${assignment.id}`)}
                        >
                            <div className='flex items-start justify-between mb-6'>
                                <div className='p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl group-hover:scale-110 transition-transform'>
                                    {assignment.status === 'pending' ? (
                                        <Clock className='h-6 w-6 text-orange-500' />
                                    ) : assignment.status === 'submitted' ? (
                                        <AlertCircle className='h-6 w-6 text-blue-500' />
                                    ) : (
                                        <CheckCircle2 className='h-6 w-6 text-emerald-500' />
                                    )}
                                </div>
                                <div className='text-right'>
                                    <span
                                        className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                            assignment.status === 'pending'
                                                ? 'bg-orange-500/10 text-orange-600 border-orange-500/20'
                                                : assignment.status === 'submitted'
                                                  ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                                  : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                        }`}
                                    >
                                        {assignment.status}
                                    </span>
                                </div>
                            </div>

                            <h3 className='text-2xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors leading-tight'>
                                {assignment.title}
                            </h3>
                            <p className='text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-6'>
                                {assignment.courseName}
                            </p>

                            <div className='grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-white/5'>
                                <div className='flex items-center gap-3'>
                                    <div className='p-2 bg-slate-100 dark:bg-white/5 rounded-xl'>
                                        <Calendar className='h-4 w-4 text-slate-400' />
                                    </div>
                                    <div>
                                        <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Deadline</p>
                                        <p className='text-xs font-bold text-slate-700 dark:text-slate-300'>{formatDate(assignment.dueDate)}</p>
                                    </div>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <div className='p-2 bg-slate-100 dark:bg-white/5 rounded-xl'>
                                        <Sparkles className='h-4 w-4 text-blue-500' />
                                    </div>
                                    <div>
                                        <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Points</p>
                                        <p className='text-xs font-bold text-slate-700 dark:text-slate-300'>{assignment.points} EXP</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='glass-card p-16 text-center border-dashed border-2'>
                    <div className='w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6'>
                        <CheckCircle2 className='h-10 w-10 text-slate-300' />
                    </div>
                    <h3 className='text-2xl font-black text-slate-900 dark:text-white mb-2'>No assignments found</h3>
                    <p className='text-slate-500 dark:text-slate-400 font-medium'>You have no assignments matching this filter.</p>
                </div>
            )}
        </AppLayout>
    );
}
