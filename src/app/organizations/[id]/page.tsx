'use client';

import {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';

import AppLayout from '@/components/AppLayout';
import CourseCard from '@/components/CourseCard';
import MemberManagement from '@/components/MemberManagement';
import api from '@/lib/api';
import {formatDate} from '@/lib/utils';
import {useAuthStore} from '@/store/authStore';
import {Category, Course, Level, Organization} from '@/types';

import {ArrowLeft, BookOpen, Building2, Calendar, Globe, Settings, Shield, Upload, UserMinus, UserPlus, Users, X} from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrganizationDetailPage() {
    const router = useRouter();
    const params = useParams();
    const {isAuthenticated, isInitialized, user} = useAuthStore();
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMember, setIsMember] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [joining, setJoining] = useState(false);
    const [activeTab, setActiveTab] = useState<'courses' | 'members' | 'settings'>('courses');
    const [updatingVisibility, setUpdatingVisibility] = useState(false);
    const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
    const [creatingCourse, setCreatingCourse] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [levels, setLevels] = useState<Level[]>([]);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
    const [newCourse, setNewCourse] = useState({
        title: '',
        description: '',
        category: '',
        level: '',
        duration: '',
        price: 0,
        is_free: true,
        allows_installments: false,
        installment_count: 1,
    });

    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        fetchOrganizationData();
        fetchCategoriesAndLevels();
    }, [isAuthenticated, isInitialized, router, params.id]);

    const fetchCategoriesAndLevels = async () => {
        try {
            const [categoriesRes, levelsRes] = await Promise.all([api.get('/categories/'), api.get('/levels/')]);
            setCategories(categoriesRes.data.results || categoriesRes.data || []);
            setLevels(levelsRes.data.results || levelsRes.data || []);
        } catch (error) {
            console.error('Error fetching categories/levels:', error);
        }
    };

    const fetchOrganizationData = async () => {
        try {
            console.log('Fetching organization with ID:', params.id);

            // Fetch organizations first
            const allOrgsRes = await api.get('/auth/organizations/');

            console.log('All organizations response:', allOrgsRes.data);
            console.log('User roles:', user?.roles);

            // Extract organizations from paginated response
            const orgsList = Array.isArray(allOrgsRes.data) ? allOrgsRes.data : allOrgsRes.data.results || [];

            // Find the specific organization
            const foundOrg = orgsList.find((org: Organization) => org.id === params.id);

            console.log('Found organization:', foundOrg);

            if (!foundOrg) {
                // User is not a member of this organization
                toast.error('You are not a member of this organization');
                router.push('/organizations/browse');
                return;
            }

            setOrganization(foundOrg);

            // Check if user is admin of this organization
            const userRole = user?.roles?.find((r) => r.org === params.id);
            const isOrgAdmin = userRole?.role === 'admin' || foundOrg.creator === user?.id;
            setIsAdmin(isOrgAdmin);
            setIsMember(true);

            console.log('User role in this org:', userRole);
            console.log('Is admin:', isOrgAdmin);

            // Only fetch courses if user is a member (we found the org in their list)
            try {
                const coursesRes = await api.get(`/org/${params.id}/courses/`);

                // Log courses response for debugging
                console.log('=== COURSES DEBUG ===');
                console.log('Organization ID:', params.id);
                console.log('Courses API response:', coursesRes.data);
                console.log('Number of courses:', coursesRes.data.results?.length || coursesRes.data?.length || 0);

                const coursesList = coursesRes.data.results || coursesRes.data || [];
                console.log('Courses list:', coursesList);

                // Check if courses actually belong to this organization
                if (coursesList.length > 0) {
                    console.log('First course organization ID:', coursesList[0].organization);
                    console.log('Does it match?', coursesList[0].organization === params.id);
                }
                console.log('===================');

                setCourses(coursesList);
            } catch (courseError: any) {
                console.error('Error fetching courses:', courseError);
                // If we get permission error, user might not have access to courses yet
                if (courseError.response?.status === 403) {
                    console.log('No permission to view courses - might be pending approval');
                    toast.dismiss('Your membership is pending approval');
                    setCourses([]);
                } else {
                    throw courseError;
                }
            }
        } catch (error: any) {
            console.error('Error fetching organization:', error.response?.data || error);

            // Handle specific error cases
            if (error.response?.status === 403) {
                toast.error('You do not have permission to view this organization');
            } else if (error.response?.status === 404) {
                toast.error('Organization not found');
            } else {
                toast.error(error.response?.data?.detail || 'Failed to load organization details');
            }

            router.push('/organizations/browse');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinLeave = async () => {
        setJoining(true);
        try {
            if (isMember) {
                await api.post(`/auth/org/${params.id}/leave/`);
                toast.success('Left organization successfully');
                router.push('/organizations');
            } else {
                await api.post(`/auth/org/${params.id}/enroll/`);
                toast.success('Joined organization successfully');
                fetchOrganizationData();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.detail || `Failed to ${isMember ? 'leave' : 'join'} organization`);
        } finally {
            setJoining(false);
        }
    };

    const handleToggleVisibility = async () => {
        if (!organization) return;

        setUpdatingVisibility(true);
        try {
            await api.patch(`/auth/organizations/${params.id}/`, {
                is_public: !organization.is_public,
            });

            toast.success(`Organization is now ${!organization.is_public ? 'public' : 'private'}`);

            // Update local state
            setOrganization({
                ...organization,
                is_public: !organization.is_public,
            });
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to update visibility');
        } finally {
            setUpdatingVisibility(false);
        }
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingCourse(true);

        try {
            // Use FormData for multipart/form-data
            const formData = new FormData();
            formData.append('title', newCourse.title);
            formData.append('description', newCourse.description);
            formData.append('category', newCourse.category);
            formData.append('level', newCourse.level);
            formData.append('duration', newCourse.duration);
            formData.append('price', newCourse.price.toString());
            formData.append('is_free', newCourse.is_free.toString());
            formData.append('allows_installments', newCourse.allows_installments.toString());
            formData.append('installment_count', newCourse.installment_count.toString());

            if (thumbnailFile) {
                formData.append('thumbnail', thumbnailFile);
            }

            const response = await api.post(`/org/${params.id}/courses/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Course created successfully! Now add modules and lessons.');
            setShowCreateCourseModal(false);
            setNewCourse({
                title: '',
                description: '',
                category: '',
                level: '',
                duration: '',
                price: 0,
                is_free: true,
                allows_installments: false,
                installment_count: 1,
            });
            setThumbnailFile(null);
            setThumbnailPreview('');

            // Redirect to course management page where they can add modules/lessons
            const courseId = response.data.id;
            router.push(`/courses/${courseId}/manage`);
        } catch (error: any) {
            console.error('Error creating course:', error.response?.data);
            toast.error(error.response?.data?.detail || 'Failed to create course');
        } finally {
            setCreatingCourse(false);
        }
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnailFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeThumbnail = () => {
        setThumbnailFile(null);
        setThumbnailPreview('');
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

    if (!organization) {
        return null;
    }

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

                {/* Organization Header */}
                <div className='glass-card p-6 lg:p-8'>
                    <div className='flex flex-col lg:flex-row gap-6 items-start'>
                        <div className='w-20 h-20 bg-primary-900 dark:bg-primary-800 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-900/20'>
                            <Building2 className='h-10 w-10 text-white' />
                        </div>

                        <div className='flex-1'>
                            <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4'>
                                <div>
                                    <div className='flex items-center gap-3 mb-2'>
                                        <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>{organization.name}</h1>
                                        {isAdmin && (
                                            <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-900/50 text-primary-900 dark:text-primary-300 border border-primary-200/50 dark:border-primary-800/50'>
                                                <Shield className='h-3 w-3' />
                                                Admin
                                            </span>
                                        )}
                                    </div>
                                    {organization.description && <p className='text-slate-600 dark:text-slate-400'>{organization.description}</p>}
                                </div>

                                {!isAdmin && (
                                    <button
                                        onClick={handleJoinLeave}
                                        disabled={joining}
                                        className={`btn-primary whitespace-nowrap flex items-center gap-2 ${
                                            isMember ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600' : ''
                                        }`}
                                    >
                                        {joining ? (
                                            <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                                        ) : isMember ? (
                                            <>
                                                <UserMinus className='h-5 w-5' />
                                                <span>Leave</span>
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className='h-5 w-5' />
                                                <span>Join</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            <div className='flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400'>
                                <div className='flex items-center gap-2'>
                                    <Users className='h-4 w-4' />
                                    <span>{organization.member_count || 0} members</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <BookOpen className='h-4 w-4' />
                                    <span>{courses.length} courses</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Globe className='h-4 w-4' />
                                    <span>{organization.is_public ? 'Public' : 'Private'}</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Calendar className='h-4 w-4' />
                                    <span>Created {formatDate(organization.created_at)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs for Admin */}
                {isAdmin && (
                    <div className='glass-card p-2'>
                        <div className='flex gap-2'>
                            <button
                                onClick={() => setActiveTab('courses')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                    activeTab === 'courses'
                                        ? 'bg-primary-900 dark:bg-primary-800 text-white shadow-lg'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <BookOpen className='h-4 w-4' />
                                <span>Courses</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('members')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                    activeTab === 'members'
                                        ? 'bg-primary-900 dark:bg-primary-800 text-white shadow-lg'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <Users className='h-4 w-4' />
                                <span>Members</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                    activeTab === 'settings'
                                        ? 'bg-primary-900 dark:bg-primary-800 text-white shadow-lg'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <Settings className='h-4 w-4' />
                                <span>Settings</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Content based on active tab */}
                {activeTab === 'courses' && (
                    <div>
                        <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-2xl font-bold text-slate-900 dark:text-white'>Courses</h2>
                            {isAdmin && (
                                <button
                                    onClick={() => setShowCreateCourseModal(true)}
                                    className='btn-primary flex items-center gap-2'
                                >
                                    <BookOpen className='h-5 w-5' />
                                    <span>Create Course</span>
                                </button>
                            )}
                        </div>

                        {courses.length > 0 ? (
                            <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                                {courses.map((course) => (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className='glass-card text-center py-12'>
                                <div className='w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4'>
                                    <BookOpen className='h-8 w-8 text-primary-600 dark:text-primary-400' />
                                </div>
                                <h3 className='text-xl font-bold text-slate-900 dark:text-white mb-2'>No Courses Yet</h3>
                                <p className='text-slate-600 dark:text-slate-400 mb-4'>
                                    {isAdmin ? 'Create your first course to get started.' : "This organization hasn't added any courses yet."}
                                </p>
                                {isAdmin && (
                                    <button
                                        onClick={() => setShowCreateCourseModal(true)}
                                        className='btn-primary flex items-center gap-2 mx-auto'
                                    >
                                        <BookOpen className='h-5 w-5' />
                                        <span>Create Course</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'members' && isAdmin && (
                    <div>
                        <MemberManagement orgId={params.id as string} />
                    </div>
                )}

                {activeTab === 'settings' && isAdmin && (
                    <div className='glass-card p-6'>
                        <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-6'>Organization Settings</h2>
                        <div className='space-y-6'>
                            <div>
                                <label className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>Organization Name</label>
                                <input
                                    type='text'
                                    value={organization.name}
                                    disabled
                                    className='input-field opacity-60 cursor-not-allowed'
                                />
                                <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>Contact support to change organization name</p>
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3'>Visibility</label>
                                <div className='space-y-3'>
                                    <label
                                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!organization.is_public ? 'border-primary-900 bg-primary-50 dark:bg-primary-900/10' : 'border-slate-200 dark:border-slate-700'}`}
                                    >
                                        <input
                                            type='radio'
                                            name='visibility'
                                            checked={!organization.is_public}
                                            onChange={() => !updatingVisibility && handleToggleVisibility()}
                                            disabled={updatingVisibility}
                                            className='mt-1 w-5 h-5 text-primary-900 focus:ring-primary-900'
                                        />
                                        <div className='flex-1'>
                                            <div className='font-bold text-slate-900 dark:text-white mb-1'>Private</div>
                                            <div className='text-xs text-slate-600 dark:text-slate-400'>
                                                Users must request to join and wait for admin approval
                                            </div>
                                        </div>
                                    </label>

                                    <label
                                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${organization.is_public ? 'border-primary-900 bg-primary-50 dark:bg-primary-900/10' : 'border-slate-200 dark:border-slate-700'}`}
                                    >
                                        <input
                                            type='radio'
                                            name='visibility'
                                            checked={organization.is_public}
                                            onChange={() => !updatingVisibility && handleToggleVisibility()}
                                            disabled={updatingVisibility}
                                            className='mt-1 w-5 h-5 text-primary-900 focus:ring-primary-900'
                                        />
                                        <div className='flex-1'>
                                            <div className='font-bold text-slate-900 dark:text-white mb-1'>Public</div>
                                            <div className='text-xs text-slate-600 dark:text-slate-400'>
                                                Anyone can join instantly without approval
                                            </div>
                                        </div>
                                    </label>
                                </div>
                                {updatingVisibility && (
                                    <p className='text-xs text-primary-600 dark:text-primary-400 mt-2 flex items-center gap-2'>
                                        <div className='w-3 h-3 border-2 border-primary-600 border-t-transparent rounded-full animate-spin'></div>
                                        Updating...
                                    </p>
                                )}
                            </div>

                            <div className='pt-4 border-t border-slate-200 dark:border-slate-700'>
                                <h3 className='text-lg font-bold text-slate-900 dark:text-white mb-2'>Danger Zone</h3>
                                <p className='text-sm text-slate-600 dark:text-slate-400 mb-4'>
                                    Deleting an organization is permanent and cannot be undone.
                                </p>
                                <button className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors'>
                                    Delete Organization
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Course Modal */}
            {showCreateCourseModal && (
                <div className='fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300'>
                    <div className='glass-card max-w-2xl w-full p-8 border border-white/20 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto'>
                        <div className='flex items-center gap-3 mb-6'>
                            <div className='p-3 bg-primary-500/10 dark:bg-primary-500/20 rounded-2xl'>
                                <BookOpen className='h-6 w-6 text-primary-600 dark:text-primary-400' />
                            </div>
                            <h2 className='text-2xl font-black text-slate-900 dark:text-white tracking-tight'>Create New Course</h2>
                        </div>

                        <form
                            onSubmit={handleCreateCourse}
                            className='space-y-5'
                        >
                            <div>
                                <label className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>Course Title</label>
                                <input
                                    type='text'
                                    required
                                    value={newCourse.title}
                                    onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-900 focus:border-transparent outline-none text-slate-900 dark:text-white'
                                    placeholder='e.g., Introduction to Web Development'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>Description</label>
                                <textarea
                                    required
                                    value={newCourse.description}
                                    onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                                    rows={4}
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-900 focus:border-transparent outline-none text-slate-900 dark:text-white resize-none'
                                    placeholder='Describe what students will learn...'
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>Category</label>
                                    <select
                                        required
                                        value={newCourse.category}
                                        onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                                        className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-900 focus:border-transparent outline-none text-slate-900 dark:text-white'
                                    >
                                        <option value=''>Select category</option>
                                        {categories.map((cat) => (
                                            <option
                                                key={cat.id}
                                                value={cat.name}
                                            >
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>Level</label>
                                    <select
                                        required
                                        value={newCourse.level}
                                        onChange={(e) => setNewCourse({...newCourse, level: e.target.value})}
                                        className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-900 focus:border-transparent outline-none text-slate-900 dark:text-white'
                                    >
                                        <option value=''>Select level</option>
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
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>Duration</label>
                                    <input
                                        type='text'
                                        required
                                        value={newCourse.duration}
                                        onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})}
                                        className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-900 focus:border-transparent outline-none text-slate-900 dark:text-white'
                                        placeholder='e.g., 8 weeks'
                                    />
                                </div>

                                <div>
                                    <label className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>Price ($)</label>
                                    <input
                                        type='number'
                                        min='0'
                                        step='0.01'
                                        value={newCourse.price}
                                        onChange={(e) => setNewCourse({...newCourse, price: parseFloat(e.target.value) || 0})}
                                        disabled={newCourse.is_free}
                                        className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-900 focus:border-transparent outline-none text-slate-900 dark:text-white disabled:opacity-50'
                                        placeholder='0.00'
                                    />
                                </div>
                            </div>

                            {/* Thumbnail Upload */}
                            <div>
                                <label className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>Course Thumbnail</label>
                                <div className='flex items-center gap-4'>
                                    {thumbnailPreview && (
                                        <div className='relative w-24 h-24 rounded-lg overflow-hidden'>
                                            <img
                                                src={thumbnailPreview}
                                                alt='Thumbnail preview'
                                                className='w-full h-full object-cover'
                                            />
                                            <button
                                                type='button'
                                                onClick={() => {
                                                    setThumbnailFile(null);
                                                    setThumbnailPreview('');
                                                }}
                                                className='absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition'
                                            >
                                                <X className='h-3 w-3' />
                                            </button>
                                        </div>
                                    )}
                                    <label className='flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-primary-900 dark:hover:border-primary-600 transition'>
                                        <Upload className='h-5 w-5 text-slate-400' />
                                        <span className='text-sm text-slate-600 dark:text-slate-400'>
                                            {thumbnailFile ? thumbnailFile.name : 'Upload thumbnail'}
                                        </span>
                                        <input
                                            type='file'
                                            accept='image/*'
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setThumbnailFile(file);
                                                    setThumbnailPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                            className='hidden'
                                        />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className='flex items-center gap-3 cursor-pointer'>
                                    <input
                                        type='checkbox'
                                        checked={newCourse.is_free}
                                        onChange={(e) =>
                                            setNewCourse({...newCourse, is_free: e.target.checked, price: e.target.checked ? 0 : newCourse.price})
                                        }
                                        className='w-5 h-5 text-primary-900 rounded focus:ring-primary-900'
                                    />
                                    <span className='text-sm font-semibold text-slate-700 dark:text-slate-300'>This course is free</span>
                                </label>
                            </div>

                            {!newCourse.is_free && (
                                <div>
                                    <label className='flex items-center gap-3 cursor-pointer mb-3'>
                                        <input
                                            type='checkbox'
                                            checked={newCourse.allows_installments}
                                            onChange={(e) =>
                                                setNewCourse({
                                                    ...newCourse,
                                                    allows_installments: e.target.checked,
                                                    installment_count: e.target.checked ? newCourse.installment_count : 1,
                                                })
                                            }
                                            className='w-5 h-5 text-primary-900 rounded focus:ring-primary-900'
                                        />
                                        <span className='text-sm font-semibold text-slate-700 dark:text-slate-300'>Allow installment payments</span>
                                    </label>
                                    {newCourse.allows_installments && (
                                        <div>
                                            <label className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>
                                                Number of Installments
                                            </label>
                                            <input
                                                type='number'
                                                min='2'
                                                max='12'
                                                value={newCourse.installment_count}
                                                onChange={(e) => setNewCourse({...newCourse, installment_count: parseInt(e.target.value) || 1})}
                                                className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-900 focus:border-transparent outline-none text-slate-900 dark:text-white'
                                                placeholder='e.g., 3'
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className='flex gap-4 pt-4'>
                                <button
                                    type='button'
                                    onClick={() => {
                                        setShowCreateCourseModal(false);
                                        setNewCourse({
                                            title: '',
                                            description: '',
                                            category: '',
                                            level: '',
                                            duration: '',
                                            price: 0,
                                            is_free: true,
                                            allows_installments: false,
                                            installment_count: 1,
                                        });
                                        setThumbnailFile(null);
                                        setThumbnailPreview('');
                                    }}
                                    className='flex-1 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition font-bold text-sm'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    disabled={creatingCourse}
                                    className='flex-1 btn-primary text-sm !py-3'
                                >
                                    {creatingCourse ? 'Creating...' : 'Create Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
