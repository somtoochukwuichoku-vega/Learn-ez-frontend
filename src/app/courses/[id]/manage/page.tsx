'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Course, Module } from '@/types';

import {
  ArrowLeft, BookOpen, ChevronDown, ChevronRight, FileText, HelpCircle, Plus,
  Video,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CourseManagePage() {
    const router = useRouter();
    const params = useParams();
    const {isAuthenticated, isInitialized, user} = useAuthStore();
    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

    // Module modal
    const [showModuleModal, setShowModuleModal] = useState(false);
    const [creatingModule, setCreatingModule] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState('');

    // Lesson modal
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [creatingLesson, setCreatingLesson] = useState(false);
    const [selectedModuleId, setSelectedModuleId] = useState<string>('');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [newLesson, setNewLesson] = useState({
        title: '',
        content: '',
        lesson_type: 'text' as 'video' | 'text' | 'quiz',
        video_url: '',
        summary: '',
        transcript: '',
        is_preview: false,
    });

    useEffect(() => {
        if (!isInitialized) return;
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchCourseData();
    }, [isAuthenticated, isInitialized, router, params.id]);

    const fetchCourseData = async () => {
        try {
            // Fetch course details
            const coursesRes = await api.get('/courses/');
            const courses = coursesRes.data.results || coursesRes.data || [];
            const foundCourse = courses.find((c: Course) => c.id === params.id);

            if (!foundCourse) {
                toast.error('Course not found');
                router.push('/organizations');
                return;
            }

            setCourse(foundCourse);

            // Fetch modules
            const modulesRes = await api.get(`/org/${foundCourse.organization}/courses/${params.id}/modules/`);
            const modulesList = Array.isArray(modulesRes.data) ? modulesRes.data : modulesRes.data.results || [];

            // Fetch lessons for each module
            const modulesWithLessons = await Promise.all(
                modulesList.map(async (module: Module) => {
                    try {
                        const lessonsRes = await api.get(`/org/${foundCourse.organization}/modules/${module.id}/lessons/`);
                        const lessonsList = Array.isArray(lessonsRes.data) ? lessonsRes.data : lessonsRes.data.results || [];
                        return {...module, lessons: lessonsList};
                    } catch (error) {
                        console.error(`Error fetching lessons for module ${module.id}:`, error);
                        return {...module, lessons: []};
                    }
                }),
            );

            setModules(modulesWithLessons);
        } catch (error: any) {
            console.error('Error fetching course data:', error);
            toast.error('Failed to load course data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateModule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!course) return;

        setCreatingModule(true);
        try {
            await api.post(`/org/${course.organization}/courses/${params.id}/modules/`, {
                title: newModuleTitle,
                course: params.id, // Backend requires course field
            });

            toast.success('Module created successfully!');
            setShowModuleModal(false);
            setNewModuleTitle('');
            fetchCourseData();
        } catch (error: any) {
            console.error('Error creating module:', error.response?.data);
            toast.error(error.response?.data?.detail || 'Failed to create module');
        } finally {
            setCreatingModule(false);
        }
    };

    const handleCreateLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!course || !selectedModuleId) return;

        setCreatingLesson(true);
        try {
            // Use FormData for video file upload
            const formData = new FormData();
            formData.append('title', newLesson.title);
            formData.append('content', newLesson.content);
            formData.append('lesson_type', newLesson.lesson_type);
            formData.append('is_preview', newLesson.is_preview.toString());
            formData.append('module', selectedModuleId);

            if (newLesson.video_url) {
                formData.append('video_url', newLesson.video_url);
            }

            if (videoFile) {
                formData.append('video_file', videoFile);
            }

            if (newLesson.summary) {
                formData.append('summary', newLesson.summary);
            }

            if (newLesson.transcript) {
                formData.append('transcript', newLesson.transcript);
            }

            await api.post(`/org/${course.organization}/modules/${selectedModuleId}/lessons/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Lesson created successfully!');
            setShowLessonModal(false);
            setNewLesson({
                title: '',
                content: '',
                lesson_type: 'text',
                video_url: '',
                summary: '',
                transcript: '',
                is_preview: false,
            });
            setVideoFile(null);
            setSelectedModuleId('');
            fetchCourseData();
        } catch (error: any) {
            console.error('Error creating lesson:', error.response?.data);
            toast.error(error.response?.data?.detail || 'Failed to create lesson');
        } finally {
            setCreatingLesson(false);
        }
    };

    const toggleModule = (moduleId: string) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
        }
        setExpandedModules(newExpanded);
    };

    const openLessonModal = (moduleId: string) => {
        setSelectedModuleId(moduleId);
        setShowLessonModal(true);
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

    if (!course) return null;

    return (
        <AppLayout>
            <div className='space-y-6'>
                <button
                    onClick={() => router.back()}
                    className='flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors'
                >
                    <ArrowLeft className='h-4 w-4' />
                    <span>Back</span>
                </button>

                {/* Course Header */}
                <div className='glass-card p-6'>
                    <div className='flex items-start justify-between'>
                        <div>
                            <h1 className='text-3xl font-bold text-slate-900 dark:text-white mb-2'>{course.title}</h1>
                            <p className='text-slate-600 dark:text-slate-400'>{course.description}</p>
                        </div>
                        <button
                            onClick={() => setShowModuleModal(true)}
                            className='btn-primary flex items-center gap-2'
                        >
                            <Plus className='h-5 w-5' />
                            <span>Add Module</span>
                        </button>
                    </div>
                </div>

                {/* Modules List */}
                <div className='space-y-4'>
                    {modules.length > 0 ? (
                        modules.map((module, index) => (
                            <div
                                key={module.id}
                                className='glass-card'
                            >
                                <div
                                    className='p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors'
                                    onClick={() => toggleModule(module.id)}
                                >
                                    <div className='flex items-center gap-3'>
                                        {expandedModules.has(module.id) ? (
                                            <ChevronDown className='h-5 w-5 text-slate-400' />
                                        ) : (
                                            <ChevronRight className='h-5 w-5 text-slate-400' />
                                        )}
                                        <div>
                                            <h3 className='font-bold text-slate-900 dark:text-white'>
                                                Module {index + 1}: {module.title}
                                            </h3>
                                            <p className='text-sm text-slate-500 dark:text-slate-400'>{module.lessons?.length || 0} lessons</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openLessonModal(module.id);
                                        }}
                                        className='btn-secondary flex items-center gap-2 text-sm'
                                    >
                                        <Plus className='h-4 w-4' />
                                        <span>Add Lesson</span>
                                    </button>
                                </div>

                                {/* Lessons */}
                                {expandedModules.has(module.id) && (
                                    <div className='border-t border-slate-200 dark:border-slate-700 p-4 space-y-2'>
                                        {module.lessons && module.lessons.length > 0 ? (
                                            module.lessons.map((lesson, lessonIndex) => (
                                                <div
                                                    key={lesson.id}
                                                    className='flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                                                >
                                                    {lesson.lesson_type === 'video' && <Video className='h-4 w-4 text-primary-600' />}
                                                    {lesson.lesson_type === 'text' && <FileText className='h-4 w-4 text-primary-600' />}
                                                    {lesson.lesson_type === 'quiz' && <HelpCircle className='h-4 w-4 text-primary-600' />}
                                                    <span className='text-sm text-slate-700 dark:text-slate-300'>
                                                        Lesson {lessonIndex + 1}: {lesson.title}
                                                    </span>
                                                    {lesson.is_preview && (
                                                        <span className='text-xs px-2 py-1 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-400 rounded-full'>
                                                            Preview
                                                        </span>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className='text-sm text-slate-500 dark:text-slate-400 text-center py-4'>
                                                No lessons yet. Click &quot;Add Lesson&quot; to create one.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className='glass-card p-12 text-center'>
                            <BookOpen className='h-12 w-12 text-slate-300 mx-auto mb-4' />
                            <h3 className='text-xl font-bold text-slate-900 dark:text-white mb-2'>No Modules Yet</h3>
                            <p className='text-slate-600 dark:text-slate-400 mb-4'>Start building your course by adding modules</p>
                            <button
                                onClick={() => setShowModuleModal(true)}
                                className='btn-primary flex items-center gap-2 mx-auto'
                            >
                                <Plus className='h-5 w-5' />
                                <span>Add First Module</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Module Modal */}
            {showModuleModal && (
                <div className='fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50'>
                    <div className='glass-card max-w-md w-full p-8'>
                        <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-6'>Add Module</h2>
                        <form onSubmit={handleCreateModule}>
                            <div className='mb-6'>
                                <label className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>Module Title</label>
                                <input
                                    type='text'
                                    required
                                    value={newModuleTitle}
                                    onChange={(e) => setNewModuleTitle(e.target.value)}
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-900 focus:border-transparent outline-none text-slate-900 dark:text-white'
                                    placeholder='e.g., Introduction to React'
                                />
                            </div>
                            <div className='flex gap-4'>
                                <button
                                    type='button'
                                    onClick={() => {
                                        setShowModuleModal(false);
                                        setNewModuleTitle('');
                                    }}
                                    className='flex-1 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition font-bold text-sm'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    disabled={creatingModule}
                                    className='flex-1 btn-primary text-sm !py-3'
                                >
                                    {creatingModule ? 'Creating...' : 'Create Module'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Lesson Modal */}
            {showLessonModal && (
                <div className='fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50'>
                    <div className='glass-card max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto'>
                        <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-6'>Add Lesson</h2>
                        <form
                            onSubmit={handleCreateLesson}
                            className='space-y-5'
                        >
                            <div>
                                <label className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>Lesson Title</label>
                                <input
                                    type='text'
                                    required
                                    value={newLesson.title}
                                    onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-900 focus:border-transparent outline-none text-slate-900 dark:text-white'
                                    placeholder='e.g., Understanding Components'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>Lesson Type</label>
                                <select
                                    required
                                    value={newLesson.lesson_type}
                                    onChange={(e) => setNewLesson({...newLesson, lesson_type: e.target.value as 'video' | 'text' | 'quiz'})}
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-900 focus:border-transparent outline-none text-slate-900 dark:text-white'
                                >
                                    <option value='text'>Text</option>
                                    <option value='video'>Video</option>
                                    <option value='quiz'>Quiz</option>
                                </select>
                            </div>

                            {newLesson.lesson_type === 'video' && (
                                <>
                                    <div>
                                        <label className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>Video URL</label>
                                        <input
                                            type='url'
                                            value={newLesson.video_url}
                                            onChange={(e) => setNewLesson({...newLesson, video_url: e.target.value})}
                                            className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-900 focus:border-transparent outline-none text-slate-900 dark:text-white'
                                            placeholder='https://youtube.com/watch?v=...'
                                        />
                                        <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>Or upload a video file below</p>
                                    </div>

                                    <div>
                                        <label className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>
                                            Video File Upload
                                        </label>
                                        <label className='flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-primary-900 dark:hover:border-primary-600 transition'>
                                            <Video className='h-5 w-5 text-slate-400' />
                                            <span className='text-sm text-slate-600 dark:text-slate-400'>
                                                {videoFile ? videoFile.name : 'Upload video file'}
                                            </span>
                                            <input
                                                type='file'
                                                accept='video/*'
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setVideoFile(file);
                                                    }
                                                }}
                                                className='hidden'
                                            />
                                        </label>
                                        {videoFile && (
                                            <button
                                                type='button'
                                                onClick={() => setVideoFile(null)}
                                                className='text-xs text-red-600 dark:text-red-400 mt-1 hover:underline'
                                            >
                                                Remove file
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}

                            <div>
                                <label className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>Content</label>
                                <textarea
                                    required
                                    value={newLesson.content}
                                    onChange={(e) => setNewLesson({...newLesson, content: e.target.value})}
                                    rows={6}
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-900 focus:border-transparent outline-none text-slate-900 dark:text-white resize-none'
                                    placeholder='Lesson content...'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>Summary (Optional)</label>
                                <textarea
                                    value={newLesson.summary}
                                    onChange={(e) => setNewLesson({...newLesson, summary: e.target.value})}
                                    rows={3}
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-900 focus:border-transparent outline-none text-slate-900 dark:text-white resize-none'
                                    placeholder='Brief summary of the lesson...'
                                />
                            </div>

                            {newLesson.lesson_type === 'video' && (
                                <div>
                                    <label className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>
                                        Transcript (Optional)
                                    </label>
                                    <textarea
                                        value={newLesson.transcript}
                                        onChange={(e) => setNewLesson({...newLesson, transcript: e.target.value})}
                                        rows={4}
                                        className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-900 focus:border-transparent outline-none text-slate-900 dark:text-white resize-none'
                                        placeholder='Video transcript...'
                                    />
                                    <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
                                        You can also generate this automatically using AI after creating the lesson
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className='flex items-center gap-3 cursor-pointer'>
                                    <input
                                        type='checkbox'
                                        checked={newLesson.is_preview}
                                        onChange={(e) => setNewLesson({...newLesson, is_preview: e.target.checked})}
                                        className='w-5 h-5 text-primary-900 rounded focus:ring-primary-900'
                                    />
                                    <span className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
                                        Allow preview (non-enrolled students can view)
                                    </span>
                                </label>
                            </div>

                            <div className='flex gap-4 pt-4'>
                                <button
                                    type='button'
                                    onClick={() => {
                                        setShowLessonModal(false);
                                        setNewLesson({
                                            title: '',
                                            content: '',
                                            lesson_type: 'text',
                                            video_url: '',
                                            summary: '',
                                            transcript: '',
                                            is_preview: false,
                                        });
                                        setVideoFile(null);
                                        setSelectedModuleId('');
                                    }}
                                    className='flex-1 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition font-bold text-sm'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    disabled={creatingLesson}
                                    className='flex-1 btn-primary text-sm !py-3'
                                >
                                    {creatingLesson ? 'Creating...' : 'Create Lesson'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
