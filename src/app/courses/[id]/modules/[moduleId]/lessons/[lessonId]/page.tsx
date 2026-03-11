'use client';

import {useEffect, useState} from 'react';
import {useRouter, useParams} from 'next/navigation';
import {useAuthStore} from '@/store/authStore';
import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';
import {Lesson, Module, Course} from '@/types';
import {ChevronLeft, ChevronRight, CheckCircle, FileText, PlayCircle, BookOpen, Clock, Sparkles, Zap, ArrowLeft} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LessonPage() {
    const router = useRouter();
    const params = useParams();
    const {isAuthenticated, isInitialized} = useAuthStore();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [module, setModule] = useState<Module | null>(null);
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        fetchLessonData();
    }, [isAuthenticated, isInitialized, router, params]);

    const fetchLessonData = async () => {
        try {
            // Fetch course to get organization ID
            const coursesRes = await api.get('/courses/');
            const courses = coursesRes.data.results || coursesRes.data || [];
            const foundCourse = courses.find((c: Course) => c.id === params.id);

            if (!foundCourse) {
                toast.error('Course not found');
                return;
            }

            setCourse(foundCourse);
            const orgId = foundCourse.organization;

            // Fetch module details
            const moduleRes = await api.get(`/org/${orgId}/modules/${params.moduleId}/`);
            setModule(moduleRes.data);

            // Fetch lessons for this module
            const lessonsRes = await api.get(`/org/${orgId}/modules/${params.moduleId}/lessons/`);
            const lessonsList = Array.isArray(lessonsRes.data) ? lessonsRes.data : lessonsRes.data.results || [];

            // Add lessons to module
            moduleRes.data.lessons = lessonsList;
            setModule(moduleRes.data);

            // Find the specific lesson
            const foundLesson = lessonsList.find((l: Lesson) => l.id === params.lessonId);

            if (!foundLesson) {
                toast.error('Lesson not found');
                return;
            }

            setLesson(foundLesson);
        } catch (error) {
            console.error('Error fetching lesson:', error);
            toast.error('Failed to load lesson');
        } finally {
            setLoading(false);
        }
    };

    const handlePreviousLesson = () => {
        if (!module || !lesson) return;

        const currentIndex = module.lessons?.findIndex((l) => l.id === lesson.id) || 0;
        if (currentIndex > 0 && module.lessons) {
            const prevLesson = module.lessons[currentIndex - 1];
            router.push(`/courses/${params.id}/modules/${params.moduleId}/lessons/${prevLesson.id}`);
        }
    };

    const handleNextLesson = () => {
        if (!module || !lesson) return;

        const currentIndex = module.lessons?.findIndex((l) => l.id === lesson.id) || 0;
        if (module.lessons && currentIndex < module.lessons.length - 1) {
            const nextLesson = module.lessons[currentIndex + 1];
            router.push(`/courses/${params.id}/modules/${params.moduleId}/lessons/${nextLesson.id}`);
        }
    };

    const handleMarkComplete = async () => {
        try {
            // In a real implementation, you would call an API to mark the lesson as complete
            toast.success('Lesson marked as complete!');
            handleNextLesson();
        } catch (error) {
            toast.error('Failed to mark lesson as complete');
        }
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

    if (!lesson || !module || !course) {
        return (
            <AppLayout>
                <div className='glass-card p-16 text-center border-dashed border-2'>
                    <div className='w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6'>
                        <BookOpen className='h-10 w-10 text-slate-300' />
                    </div>
                    <h3 className='text-2xl font-black text-slate-900 dark:text-white mb-2'>Lesson not found</h3>
                    <p className='text-slate-500 dark:text-slate-400 font-medium'>
                        The lesson you are looking for does not exist or has been removed.
                    </p>
                </div>
            </AppLayout>
        );
    }

    const currentIndex = module.lessons?.findIndex((l) => l.id === lesson.id) || 0;
    const hasPrevious = currentIndex > 0;
    const hasNext = module.lessons && currentIndex < module.lessons.length - 1;

    return (
        <AppLayout>
            <div className='mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6'>
                <div>
                    <button
                        onClick={() => router.push(`/courses/${params.id}`)}
                        className='inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors mb-4 group'
                    >
                        <ArrowLeft className='h-3 w-3 transform group-hover:-translate-x-1 transition-transform' />
                        Back to Syllabus
                    </button>
                    <h1 className='text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight'>{lesson.title}</h1>
                    <div className='flex items-center gap-4 text-slate-500 dark:text-slate-400 font-medium text-sm'>
                        <span className='flex items-center gap-1.5'>
                            <BookOpen className='h-4 w-4 text-blue-500' />
                            {course.title}
                        </span>
                        <span className='w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700'></span>
                        <span>{module.title}</span>
                    </div>
                </div>

                <div className='flex gap-2 p-1.5 glass rounded-2xl'>
                    <button
                        onClick={handlePreviousLesson}
                        disabled={!hasPrevious}
                        className='p-3 rounded-xl hover:bg-white dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all'
                        title='Previous Lesson'
                    >
                        <ChevronLeft className='h-5 w-5' />
                    </button>
                    <div className='w-px h-10 bg-slate-200 dark:bg-white/10'></div>
                    <button
                        onClick={handleNextLesson}
                        disabled={!hasNext}
                        className='p-3 rounded-xl hover:bg-white dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all'
                        title='Next Lesson'
                    >
                        <ChevronRight className='h-5 w-5' />
                    </button>
                </div>
            </div>

            <div className='grid lg:grid-cols-3 gap-10 items-start'>
                <div className='lg:col-span-2 space-y-8'>
                    {/* Content Player Card */}
                    <div className='glass-card overflow-hidden border border-white/20 dark:border-white/5 card-glow'>
                        {lesson.lesson_type === 'video' && (lesson.video_url || lesson.video_file) && (
                            <div className='relative bg-slate-950 aspect-video group'>
                                <video
                                    controls
                                    className='w-full h-full'
                                    src={lesson.video_file || lesson.video_url}
                                >
                                    Your browser does not support the video tag.
                                </video>
                                <div className='absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none'></div>
                            </div>
                        )}

                        <div className='p-8'>
                            <div className='flex items-center gap-3 mb-8'>
                                <div className='w-12 h-12 rounded-[1.25rem] bg-blue-500/10 dark:bg-blue-600/20 flex items-center justify-center text-blue-600 border border-blue-500/20 shadow-lg shadow-blue-500/5'>
                                    {lesson.lesson_type === 'video' ? <PlayCircle className='h-6 w-6' /> : <FileText className='h-6 w-6' />}
                                </div>
                                <div>
                                    <h2 className='text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase'>Phased Instruction</h2>
                                    <p className='text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase'>Type: {lesson.lesson_type}</p>
                                </div>
                            </div>

                            {lesson.content && (
                                <div className='prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 font-medium leading-relaxed'>
                                    <div dangerouslySetInnerHTML={{__html: lesson.content}} />
                                </div>
                            )}

                            {lesson.summary && (
                                <div className='mt-10 p-8 glass border border-blue-500/10 rounded-[2rem] bg-blue-500/[0.02] relative overflow-hidden'>
                                    <div className='absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl'></div>
                                    <h3 className='text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2'>
                                        <Sparkles className='h-4 w-4' />
                                        Executive Summary
                                    </h3>
                                    <p className='text-slate-600 dark:text-slate-300 leading-relaxed relative z-10'>{lesson.summary}</p>
                                </div>
                            )}

                            {lesson.transcript && (
                                <div className='mt-8 pt-8 border-t border-slate-100 dark:border-white/5'>
                                    <h3 className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4'>Full Transcript</h3>
                                    <p className='text-sm text-slate-500 dark:text-slate-500 whitespace-pre-wrap leading-loose'>
                                        {lesson.transcript}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Completion Action */}
                    <div className='flex flex-col sm:flex-row items-center justify-between p-8 glass-card border border-emerald-500/20 bg-emerald-500/[0.02]'>
                        <div className='mb-6 sm:mb-0'>
                            <h3 className='text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase'>Mark Progress</h3>
                            <p className='text-xs font-medium text-slate-500 uppercase tracking-widest mt-1'>
                                Finalize this phase to unlock the next
                            </p>
                        </div>
                        <button
                            onClick={handleMarkComplete}
                            className='btn-primary !from-emerald-600 !to-teal-600 shadow-emerald-500/20 px-10 py-4 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em]'
                        >
                            <CheckCircle className='h-5 w-5' />
                            Verified Completion
                        </button>
                    </div>
                </div>

                {/* Module Sidebar */}
                <div className='lg:col-span-1 space-y-6 sticky top-8'>
                    <div className='glass-card p-6 border border-white/20 dark:border-white/5'>
                        <h2 className='text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-2'>Module Progress</h2>
                        <div className='space-y-2'>
                            {module.lessons?.map((l, index) => (
                                <div
                                    key={l.id}
                                    onClick={() => router.push(`/courses/${params.id}/modules/${params.moduleId}/lessons/${l.id}`)}
                                    className={`w-full p-4 rounded-2xl transition-all cursor-pointer group/nav ${
                                        l.id === lesson.id
                                            ? 'glass !bg-blue-600/10 border-2 border-blue-500/40 shadow-blue-500/5 shadow-lg'
                                            : 'hover:bg-slate-50 dark:hover:bg-white/[0.03] border-2 border-transparent'
                                    }`}
                                >
                                    <div className='flex items-center gap-4'>
                                        <div
                                            className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                                                l.id === lesson.id
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-100 dark:bg-white/5 text-slate-400 group-hover/nav:text-blue-500 transition-colors'
                                            }`}
                                        >
                                            {l.lesson_type === 'video' ? <PlayCircle className='h-4 w-4' /> : <FileText className='h-4 w-4' />}
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <p
                                                className={`text-xs font-black tracking-tight truncate ${l.id === lesson.id ? 'text-blue-600' : 'text-slate-900 dark:text-white'}`}
                                            >
                                                {index + 1}. {l.title}
                                            </p>
                                            <p className='text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5'>{l.lesson_type}</p>
                                        </div>
                                        {l.id === lesson.id && <div className='w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse'></div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='glass-card p-6 border-dashed border-2 border-slate-200 dark:border-white/10 text-center'>
                        <div className='flex justify-center mb-4'>
                            <div className='w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500'>
                                <Zap className='h-5 w-5' />
                            </div>
                        </div>
                        <h4 className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2'>Learning Speed</h4>
                        <p className='text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]'>
                            You are pacing 15% faster than typical learners in this module.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
