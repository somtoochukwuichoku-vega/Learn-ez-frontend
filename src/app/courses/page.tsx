'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAuthStore} from '@/store/authStore';
import AppLayout from '@/components/AppLayout';
import CourseCard from '@/components/CourseCard';
import api from '@/lib/api';
import {Course, Category, Level} from '@/types';
import {Search, Filter, Sparkles, X} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CoursesPage() {
    const router = useRouter();
    const {isAuthenticated, isInitialized} = useAuthStore();
    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [levels, setLevels] = useState<Level[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');

    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        fetchData();
    }, [isAuthenticated, isInitialized, router]);

    useEffect(() => {
        filterCourses();
    }, [searchTerm, selectedCategory, selectedLevel, courses]);

    const fetchData = async () => {
        try {
            const [coursesRes, categoriesRes, levelsRes] = await Promise.all([api.get('/courses/'), api.get('/categories/'), api.get('/levels/')]);

            const coursesData = coursesRes.data.results || coursesRes.data || [];
            setCourses(coursesData);
            setFilteredCourses(coursesData);
            setCategories(categoriesRes.data.results || categoriesRes.data || []);
            setLevels(levelsRes.data.results || levelsRes.data || []);
        } catch (error) {
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const filterCourses = () => {
        let filtered = courses;

        if (searchTerm) {
            filtered = filtered.filter(
                (course) =>
                    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    course.description.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }

        if (selectedCategory) {
            filtered = filtered.filter((course) => course.category === selectedCategory);
        }

        if (selectedLevel) {
            filtered = filtered.filter((course) => course.level === selectedLevel);
        }

        setFilteredCourses(filtered);
    };

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
                    <span className='text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400'>Browse Catalog</span>
                </div>
                <h1 className='text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight'>
                    Explore <span className='text-gradient'>Courses</span>
                </h1>
                <p className='text-slate-500 dark:text-slate-400 font-medium'>Discover and enroll in courses that match your interests</p>
            </div>

            {/* Filters */}
            <div className='glass-card p-6 mb-10 border border-white/20 dark:border-white/5'>
                <div className='grid md:grid-cols-3 gap-4'>
                    <div className='relative'>
                        <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400' />
                        <input
                            type='text'
                            placeholder='Search courses...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium'
                        />
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className='px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium text-slate-700 dark:text-slate-300'
                    >
                        <option value=''>All Categories</option>
                        {categories.map((category) => (
                            <option
                                key={category.id}
                                value={category.name}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className='px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium text-slate-700 dark:text-slate-300'
                    >
                        <option value=''>All Levels</option>
                        {levels.map((level) => (
                            <option
                                key={level.id}
                                value={level.name}
                            >
                                {level.name}
                            </option>
                        ))}
                    </select>
                </div>

                {(searchTerm || selectedCategory || selectedLevel) && (
                    <div className='mt-6 flex items-center justify-between'>
                        <span className='text-sm font-bold text-slate-500'>
                            Showing <span className='text-blue-600'>{filteredCourses.length}</span> of {courses.length} courses
                        </span>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory('');
                                setSelectedLevel('');
                            }}
                            className='text-sm font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-2'
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>

            {/* Courses Grid */}
            {filteredCourses.length > 0 ? (
                <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
                    {filteredCourses.map((course) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                        />
                    ))}
                </div>
            ) : (
                <div className='glass-card p-16 text-center border-dashed border-2'>
                    <div className='relative w-20 h-20 mx-auto mb-6'>
                        <div className='absolute inset-0 bg-slate-200 dark:bg-white/5 rounded-3xl animate-pulse'></div>
                        <Filter className='relative h-full w-full p-5 text-slate-300 dark:text-slate-600' />
                    </div>
                    <h3 className='text-2xl font-black text-slate-900 dark:text-white mb-2'>No courses found</h3>
                    <p className='text-slate-500 dark:text-slate-400 font-medium mb-8'>
                        Try adjusting your filters to find what you&apos;re looking for.
                    </p>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('');
                            setSelectedLevel('');
                        }}
                        className='btn-primary flex items-center gap-2'
                    >
                        <X className='h-5 w-5' />
                        <span>Clear All Filters</span>
                    </button>
                </div>
            )}
        </AppLayout>
    );
}
