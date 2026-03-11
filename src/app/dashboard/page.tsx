'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAuthStore} from '@/store/authStore';
import AppLayout from '@/components/AppLayout';
import CourseCard from '@/components/CourseCard';
import api from '@/lib/api';
import {Course, Assignment} from '@/types';
import {BookOpen, TrendingUp, Award, Clock, Target, Zap, ArrowRight} from 'lucide-react';
import toast from 'react-hot-toast';
import {formatDate} from '@/lib/utils';

export default function DashboardPage() {
    const router = useRouter();
    const {isAuthenticated, isInitialized, user} = useAuthStore();
    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
    const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        fetchDashboardData();
    }, [isAuthenticated, isInitialized, router]);

    const fetchDashboardData = async () => {
        try {
            const [coursesRes, assignmentsRes] = await Promise.all([api.get('/enrollments/current/'), api.get('/assignments/upcoming/')]);
            setEnrolledCourses(coursesRes.data.results || coursesRes.data || []);
            setUpcomingAssignments(assignmentsRes.data.results || assignmentsRes.data || []);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className='flex items-center justify-center h-[60vh]'>
                    <div className='w-12 h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 rounded-full animate-spin'></div>
                </div>
            </AppLayout>
        );
    }

    const totalCourses = enrolledCourses.length;
    const completedCourses = enrolledCourses.filter((c) => c.progress === 100).length;
    const inProgressCourses = enrolledCourses.filter((c) => c.progress && c.progress > 0 && c.progress < 100).length;

    return (
        <AppLayout>
            <div className='space-y-6 sm:space-y-8'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                    <div>
                        <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2'>
                            Welcome back, <span className='text-blue-600 dark:text-blue-400'>{user?.username}</span>
                        </h1>
                        <p className='text-sm sm:text-base text-slate-600 dark:text-slate-400'>
                            Track your learning progress and stay on top of assignments
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/courses')}
                        className='btn-primary whitespace-nowrap flex items-center gap-2'
                    >
                        <Zap className='h-4 w-4 sm:h-5 sm:w-5' />
                        <span className='hidden sm:inline'>Continue Learning</span>
                        <span className='sm:hidden'>Learn</span>
                    </button>
                </div>

                <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6'>
                    {[
                        {label: 'Courses', value: totalCourses, icon: BookOpen, color: 'bg-blue-500', lightBg: 'bg-blue-50 dark:bg-blue-950'},
                        {
                            label: 'In Progress',
                            value: inProgressCourses,
                            icon: TrendingUp,
                            color: 'bg-purple-500',
                            lightBg: 'bg-purple-50 dark:bg-purple-950',
                        },
                        {label: 'Completed', value: completedCourses, icon: Award, color: 'bg-green-500', lightBg: 'bg-green-50 dark:bg-green-950'},
                        {
                            label: 'Assignments',
                            value: upcomingAssignments.length,
                            icon: Clock,
                            color: 'bg-orange-500',
                            lightBg: 'bg-orange-50 dark:bg-orange-950',
                        },
                    ].map((stat, i) => (
                        <div
                            key={i}
                            className='glass-card p-4 sm:p-6 hover:shadow-lg transition-shadow'
                        >
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.lightBg} rounded-xl flex items-center justify-center mb-3 sm:mb-4`}>
                                <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color.replace('bg-', 'text-')}`} />
                            </div>
                            <p className='text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-1'>{stat.label}</p>
                            <p className='text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white'>{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className='grid lg:grid-cols-3 gap-6 lg:gap-8'>
                    <div className='lg:col-span-2 space-y-4 sm:space-y-6'>
                        <div className='flex items-center justify-between'>
                            <h2 className='text-xl sm:text-2xl font-bold text-slate-900 dark:text-white'>Continue Learning</h2>
                            <button
                                onClick={() => router.push('/courses')}
                                className='text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1'
                            >
                                View All <ArrowRight className='h-4 w-4' />
                            </button>
                        </div>

                        {enrolledCourses.length > 0 ? (
                            <div className='grid sm:grid-cols-2 gap-4 sm:gap-6'>
                                {enrolledCourses.slice(0, 4).map((course) => (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className='glass-card text-center py-12 sm:py-16'>
                                <div className='w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6'>
                                    <BookOpen className='h-8 w-8 sm:h-10 sm:w-10 text-blue-600 dark:text-blue-400' />
                                </div>
                                <h3 className='text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2'>Start Learning Today</h3>
                                <p className='text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto px-4'>
                                    Discover courses and start your learning journey
                                </p>
                                <button
                                    onClick={() => router.push('/courses')}
                                    className='btn-primary flex items-center gap-2'
                                >
                                    <BookOpen className='h-5 w-5' />
                                    <span>Explore Courses</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className='space-y-4 sm:space-y-6'>
                        <div className='flex items-center gap-2'>
                            <Target className='h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400' />
                            <h2 className='text-xl sm:text-2xl font-bold text-slate-900 dark:text-white'>Upcoming</h2>
                        </div>

                        {upcomingAssignments.length > 0 ? (
                            <div className='space-y-3 sm:space-y-4'>
                                {upcomingAssignments.slice(0, 3).map((assignment) => (
                                    <div
                                        key={assignment.id}
                                        onClick={() => router.push(`/assignments/${assignment.id}`)}
                                        className='glass-card p-4 sm:p-5 hover:shadow-lg transition-all cursor-pointer group'
                                    >
                                        <div className='flex items-start justify-between mb-3'>
                                            <span className='px-2 py-1 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium'>
                                                {assignment.status}
                                            </span>
                                            <span className='text-xs font-medium text-slate-500 dark:text-slate-400'>{assignment.points} pts</span>
                                        </div>
                                        <h3 className='font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                                            {assignment.title}
                                        </h3>
                                        <p className='text-xs text-slate-500 dark:text-slate-400 mb-3'>{assignment.courseName}</p>
                                        <div className='flex items-center gap-1 text-xs text-slate-400'>
                                            <Clock className='h-3 w-3' />
                                            <span>Due {formatDate(assignment.dueDate)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className='glass-card text-center py-8 sm:py-12'>
                                <div className='w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4'>
                                    <Target className='h-6 w-6 sm:h-7 sm:w-7 text-purple-600 dark:text-purple-400' />
                                </div>
                                <p className='text-sm font-semibold text-slate-900 dark:text-white'>All caught up!</p>
                                <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>No upcoming assignments</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
