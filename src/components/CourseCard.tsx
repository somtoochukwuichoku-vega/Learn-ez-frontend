import Link from 'next/link';
import Image from 'next/image';
import {Course} from '@/types';
import {Clock, Users, Star, BookOpen} from 'lucide-react';
import {formatCurrency} from '@/lib/utils';

interface CourseCardProps {
    course: Course;
}

export default function CourseCard({course}: CourseCardProps) {
    return (
        <Link href={`/courses/${course.id}`}>
            <div className='glass-card group h-full flex flex-col p-4 border border-white/20 dark:border-white/5 card-glow'>
                {/* Thumbnail */}
                <div className='relative h-52 rounded-[2rem] overflow-hidden mb-6'>
                    {course.thumbnail ? (
                        <Image
                            src={course.thumbnail}
                            alt={course.title}
                            fill
                            className='object-cover group-hover:scale-110 transition-transform duration-700'
                        />
                    ) : (
                        <div className='w-full h-full bg-primary-900 dark:bg-primary-800 flex items-center justify-center'>
                            <BookOpen className='h-16 w-16 text-white/30 animate-pulse' />
                        </div>
                    )}

                    {/* Badges Overlay */}
                    <div className='absolute inset-x-3 top-3 flex justify-between items-start pointer-events-none'>
                        <div className='flex flex-wrap gap-2'>
                            <span className='glass !bg-white/90 dark:!bg-slate-900/80 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 border border-white/50 backdrop-blur-md'>
                                {course.category}
                            </span>
                        </div>
                        {course.isEnrolled && (
                            <div className='glass !bg-emerald-500/90 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white border border-white/30 shadow-lg shadow-emerald-500/30'>
                                Enrolled
                            </div>
                        )}
                    </div>

                    <div className='absolute inset-x-3 bottom-3 flex justify-start pointer-events-none'>
                        <span className='glass !bg-slate-900/80 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white border border-white/10'>
                            {course.level}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className='flex-1 flex flex-col'>
                    <h3 className='text-xl h-14 font-black text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors mb-3 leading-tight tracking-tight'>
                        {course.title}
                    </h3>

                    <p className='text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-6 font-medium leading-relaxed'>{course.description}</p>

                    {/* Meta Info */}
                    <div className='flex items-center gap-6 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6'>
                        <div className='flex items-center gap-1.5 group/meta'>
                            <Clock className='h-3.5 w-3.5 group-hover/meta:text-blue-500 transition-colors' />
                            <span>{course.duration}</span>
                        </div>
                        <div className='flex items-center gap-1.5 group/meta'>
                            <Users className='h-3.5 w-3.5 group-hover/meta:text-blue-500 transition-colors' />
                            <span>{course.enrolled}</span>
                        </div>
                        <div className='flex items-center gap-1.5 group/meta'>
                            <Star className='h-3.5 w-3.5 fill-yellow-400 text-yellow-400' />
                            <span className='text-slate-900 dark:text-white'>{course.rating}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {course.isEnrolled && course.progress !== undefined && (
                        <div className='space-y-2 mb-6'>
                            <div className='flex justify-between text-[11px] font-black tracking-widest uppercase'>
                                <span className='text-slate-400'>Progress</span>
                                <span className='text-blue-600 dark:text-blue-400'>{course.progress}%</span>
                            </div>
                            <div className='h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden backdrop-blur-sm'>
                                <div
                                    className='h-full bg-primary-900 dark:bg-primary-700 rounded-full transition-all duration-1000'
                                    style={{width: `${course.progress}%`}}
                                />
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className='mt-auto pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between'>
                        <div>
                            {course.is_free ? (
                                <span className='text-2xl font-black text-emerald-600'>FREE</span>
                            ) : (
                                <div className='flex flex-col'>
                                    <span className='text-2xl font-black text-slate-900 dark:text-white'>{formatCurrency(course.price)}</span>
                                    {course.allows_installments && (
                                        <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5'>
                                            or {course.installment_count} × {formatCurrency(course.installment_amount || 0)}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className='p-2 rounded-2xl bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-600 transition-all duration-300'>
                            <BookOpen className='h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors' />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
