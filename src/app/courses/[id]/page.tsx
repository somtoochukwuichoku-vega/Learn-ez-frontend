'use client';

import {useEffect, useState} from 'react';
import {useRouter, useParams} from 'next/navigation';
import {useAuthStore} from '@/store/authStore';
import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';
import {Course, Module} from '@/types';
import {Clock, Users, Star, BookOpen, PlayCircle, FileText, CheckCircle, Lock, Zap, Sparkles, ChevronRight, ArrowRight} from 'lucide-react';
import {formatCurrency} from '@/lib/utils';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function CourseDetailPage() {
    const router = useRouter();
    const params = useParams();
    const {isAuthenticated, isInitialized} = useAuthStore();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        fetchCourse();
    }, [isAuthenticated, isInitialized, router, params.id]);

    const fetchCourse = async () => {
        try {
            const response = await api.get(`/courses/`);
            const courses = response.data.results || response.data || [];
            const foundCourse = courses.find((c: Course) => c.id === params.id);

            if (foundCourse) {
                // Fetch modules for this course
                try {
                    const orgId = foundCourse.organization;
                    const modulesRes = await api.get(`/org/${orgId}/courses/${params.id}/modules/`);

                    // Handle paginated response or direct array
                    const modulesList = Array.isArray(modulesRes.data) ? modulesRes.data : modulesRes.data.results || [];

                    foundCourse.modules = modulesList;
                } catch (moduleError) {
                    console.error('Error fetching modules:', moduleError);
                    foundCourse.modules = [];
                }

                setCourse(foundCourse);
            }
        } catch (error) {
            toast.error('Failed to load course');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!course) return;

        if (course.is_free) {
            setEnrolling(true);
            try {
                await api.post('/enrollments/', {courseId: course.id});
                toast.success('Successfully enrolled!');
                fetchCourse();
            } catch (error: any) {
                toast.error(error.response?.data?.detail || 'Enrollment failed');
            } finally {
                setEnrolling(false);
            }
        } else {
            router.push(`/checkout/${course.id}`);
        }
    };

    const handleStartLesson = (moduleId: string, lessonId: string) => {
        if (!moduleId || !lessonId) {
            toast.error('No lessons available yet');
            return;
        }
        router.push(`/courses/${params.id}/modules/${moduleId}/lessons/${lessonId}`);
    };

    if (loading) {
        return (
            <AppLayout>
                <div className='flex items-center justify-center min-h-[60vh]'>
                    <div className='relative'>
                        <div className='w-16 h-16 border-4 border-blue-100 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin'></div>
                        <div className='absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse'></div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (!course) {
        return (
            <AppLayout>
                <div className='glass-card p-16 text-center border-dashed border-2'>
                    <div className='w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6'>
                        <BookOpen className='h-10 w-10 text-slate-300' />
                    </div>
                    <h3 className='text-2xl font-black text-slate-900 dark:text-white mb-2'>Course not found</h3>
                    <p className='text-slate-500 dark:text-slate-400 font-medium'>
                        The course you are looking for does not exist or has been removed.
                    </p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className='mb-10'>
                <div className='inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-4 animate-float'>
                    <Sparkles className='h-4 w-4 text-accent-purple' />
                    <span className='text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400'>Course Catalog</span>
                </div>
                <h1 className='text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight'>{course.title}</h1>
                <p className='text-slate-500 dark:text-slate-400 font-medium'>
                    Master these professional skills with guided modules and interactive lessons
                </p>
            </div>

            <div className='grid lg:grid-cols-3 gap-10 items-start'>
                <div className='lg:col-span-2 space-y-10'>
                    {/* Course Hero Segment */}
                    <div className='glass-card overflow-hidden border border-white/20 dark:border-white/5'>
                        <div className='relative h-80 bg-slate-900'>
                            {course.thumbnail ? (
                                <Image
                                    src={course.thumbnail}
                                    alt={course.title}
                                    fill
                                    className='object-cover opacity-80'
                                />
                            ) : (
                                <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700'>
                                    <BookOpen className='h-24 w-24 text-white/20' />
                                </div>
                            )}
                            <div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent'></div>
                            <div className='absolute bottom-8 left-8 right-8'>
                                <div className='flex flex-wrap gap-3'>
                                    <span className='glass !bg-blue-600/20 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-200 border border-blue-400/20'>
                                        {course.category}
                                    </span>
                                    <span className='glass !bg-white/10 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white border border-white/10'>
                                        {course.level}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className='p-8'>
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-6 mb-8'>
                                <div className='space-y-1'>
                                    <p className='text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'>Duration</p>
                                    <div className='flex items-center gap-2 text-slate-900 dark:text-white font-black'>
                                        <Clock className='h-4 w-4 text-blue-500' />
                                        <span>{course.duration}</span>
                                    </div>
                                </div>
                                <div className='space-y-1'>
                                    <p className='text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'>Students</p>
                                    <div className='flex items-center gap-2 text-slate-900 dark:text-white font-black'>
                                        <Users className='h-4 w-4 text-indigo-500' />
                                        <span>{course.enrolled}</span>
                                    </div>
                                </div>
                                <div className='space-y-1'>
                                    <p className='text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'>Rating</p>
                                    <div className='flex items-center gap-2 text-slate-900 dark:text-white font-black'>
                                        <Star className='h-4 w-4 text-yellow-500 fill-yellow-500' />
                                        <span>{course.rating}</span>
                                    </div>
                                </div>
                                <div className='space-y-1'>
                                    <p className='text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'>Lessons</p>
                                    <div className='flex items-center gap-2 text-slate-900 dark:text-white font-black'>
                                        <Zap className='h-4 w-4 text-purple-500' />
                                        <span>{course.total_lessons}</span>
                                    </div>
                                </div>
                            </div>

                            {course.isEnrolled && course.progress !== undefined && (
                                <div className='mb-10 p-6 glass border border-blue-500/10 rounded-2xl'>
                                    <div className='flex justify-between items-center mb-4'>
                                        <div className='flex items-center gap-3'>
                                            <div className='w-2 h-2 rounded-full bg-blue-500 animate-pulse'></div>
                                            <span className='text-xs font-black uppercase tracking-widest text-slate-500'>Your Mastery Progress</span>
                                        </div>
                                        <span className='text-lg font-black text-blue-600'>{course.progress}%</span>
                                    </div>
                                    <div className='w-full bg-slate-100 dark:bg-white/5 rounded-full h-2.5 overflow-hidden'>
                                        <div
                                            className='h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-1000'
                                            style={{width: `${course.progress}%`}}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className='prose prose-slate dark:prose-invert max-w-none'>
                                <h2 className='text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4'>Deep Insight</h2>
                                <p className='text-slate-600 dark:text-slate-400 leading-relaxed font-medium'>{course.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className='space-y-6'>
                        <h2 className='text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4'>Curriculum Architecture</h2>
                        <div className='space-y-4'>
                            {Array.isArray(course.modules) && course.modules.length > 0 ? (
                                course.modules.map((module, mIndex) => (
                                    <div
                                        key={module.id}
                                        className='glass-card p-1 border border-white/20 dark:border-white/5 group hover:border-blue-500/20 transition-all'
                                    >
                                        <div className='bg-slate-50/50 dark:bg-white/[0.02] p-6 rounded-[1.25rem]'>
                                            <div className='flex items-center justify-between mb-2'>
                                                <h3 className='text-lg font-black text-slate-900 dark:text-white tracking-tight'>
                                                    <span className='text-blue-500 mr-2'>0{mIndex + 1}.</span> {module.title}
                                                </h3>
                                                <span className='glass px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] text-slate-400'>
                                                    {module.lessons?.length || 0} Phases
                                                </span>
                                            </div>

                                            {module.lessons && module.lessons.length > 0 && (
                                                <div className='mt-6 space-y-2'>
                                                    {module.lessons.map((lesson, lIndex) => (
                                                        <div
                                                            key={lesson.id}
                                                            onClick={() =>
                                                                (course.isEnrolled || lesson.is_preview) && handleStartLesson(module.id, lesson.id)
                                                            }
                                                            className={`flex items-center justify-between p-4 rounded-xl transition-all group/lesson ${
                                                                course.isEnrolled || lesson.is_preview
                                                                    ? 'hover:bg-white dark:hover:bg-white/5 cursor-pointer hover:shadow-sm'
                                                                    : 'opacity-60 cursor-not-allowed'
                                                            }`}
                                                        >
                                                            <div className='flex items-center gap-4'>
                                                                <div
                                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${lesson.lesson_type === 'video' ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-500' : 'bg-purple-50 dark:bg-purple-600/10 text-purple-500'}`}
                                                                >
                                                                    {lesson.lesson_type === 'video' ? (
                                                                        <PlayCircle className='h-4 w-4' />
                                                                    ) : (
                                                                        <FileText className='h-4 w-4' />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className='text-sm font-black text-slate-900 dark:text-white tracking-tight'>
                                                                        {lesson.title}
                                                                    </p>
                                                                    <div className='flex items-center gap-2 mt-0.5'>
                                                                        <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                                                                            {lesson.lesson_type}
                                                                        </span>
                                                                        {lesson.is_preview && (
                                                                            <span className='text-[9px] font-black text-emerald-500 border border-emerald-500/20 px-1.5 rounded bg-emerald-500/5 uppercase tracking-widest'>
                                                                                Preview
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {course.isEnrolled || lesson.is_preview ? (
                                                                <ChevronRight className='h-4 w-4 text-slate-300 group-hover/lesson:text-blue-500 transform group-hover/lesson:translate-x-1 transition-all' />
                                                            ) : (
                                                                <Lock className='h-4 w-4 text-slate-400' />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className='glass-card text-center py-12'>
                                    <div className='w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4'>
                                        <BookOpen className='h-8 w-8 text-primary-600 dark:text-primary-400' />
                                    </div>
                                    <h3 className='text-xl font-bold text-slate-900 dark:text-white mb-2'>No Modules Yet</h3>
                                    <p className='text-slate-600 dark:text-slate-400'>Course content is being prepared.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Enrollment Sidebar */}
                <div className='lg:col-span-1 space-y-8 sticky top-8'>
                    <div className='glass-card p-8 border border-blue-500/20 bg-blue-500/[0.02] dark:bg-blue-600/[0.01] card-glow'>
                        {!course.isEnrolled ? (
                            <div className='mb-8'>
                                <h2 className='text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6'>Pricing Model</h2>
                                {course.is_free ? (
                                    <div className='space-y-2'>
                                        <p className='text-4xl font-black text-gradient !from-emerald-500 !to-teal-600 leading-none'>FREE</p>
                                        <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Lifetime Access Unlocked</p>
                                    </div>
                                ) : (
                                    <div className='space-y-2'>
                                        <p className='text-4xl font-black text-slate-900 dark:text-white tracking-tight'>
                                            {formatCurrency(course.price)}
                                        </p>
                                        {course.allows_installments && (
                                            <div className='glass !bg-blue-500/10 px-3 py-2 rounded-xl inline-block mt-2 border border-blue-500/20'>
                                                <p className='text-[9px] font-black text-blue-600 uppercase tracking-widest leading-relaxed'>
                                                    Flex Pay: {course.installment_count} × {formatCurrency(course.installment_amount || 0)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className='mb-8 text-center'>
                                <div className='w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-lg shadow-emerald-500/10'>
                                    <CheckCircle className='h-8 w-8 text-emerald-500' />
                                </div>
                                <h3 className='text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase'>Fully Activated</h3>
                                <p className='text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2'>Verified Enrollment</p>
                            </div>
                        )}

                        {!course.isEnrolled ? (
                            <button
                                onClick={handleEnroll}
                                disabled={enrolling}
                                className='w-full btn-primary !py-5 flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest group'
                            >
                                {enrolling ? (
                                    <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                                ) : (
                                    <>
                                        {course.is_free ? 'Claim Free Entry' : 'Claim Full Access'}
                                        <ArrowRight className='h-4 w-4 group-hover:translate-x-1 transition-transform' />
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    // Check if course has modules and lessons
                                    if (!course.modules || course.modules.length === 0) {
                                        toast.error('This course has no lessons yet');
                                        return;
                                    }

                                    const firstModule = course.modules[0];
                                    if (!firstModule.lessons || firstModule.lessons.length === 0) {
                                        toast.error('This course has no lessons yet');
                                        return;
                                    }

                                    const firstLesson = firstModule.lessons[0];
                                    handleStartLesson(firstModule.id, firstLesson.id);
                                }}
                                className='w-full btn-primary bg-secondary-600 hover:bg-secondary-700 dark:bg-secondary-700 dark:hover:bg-secondary-600 !py-5 flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest group'
                            >
                                <span>Continue Path</span>
                                <Zap className='h-4 w-4 group-hover:scale-125 transition-transform' />
                            </button>
                        )}

                        <div className='mt-8 pt-8 border-t border-slate-100 dark:border-white/5 space-y-4'>
                            <div className='flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400'>
                                <CheckCircle className='h-4 w-4 text-emerald-500' />
                                <span>Lifetime License</span>
                            </div>
                            <div className='flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400'>
                                <CheckCircle className='h-4 w-4 text-emerald-500' />
                                <span>Global Credential</span>
                            </div>
                            <div className='flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400'>
                                <CheckCircle className='h-4 w-4 text-emerald-500' />
                                <span>Cross-Device Cloud Sync</span>
                            </div>
                        </div>
                    </div>

                    <div className='glass-card p-6 border-dashed border-2 border-slate-200 dark:border-white/10 text-center'>
                        <h4 className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2'>Support & Guidance</h4>
                        <p className='text-xs font-medium text-slate-500'>
                            Need help? Our learning advisors are available 24/7 for technical assistance.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
