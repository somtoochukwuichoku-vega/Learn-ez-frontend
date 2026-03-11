'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAuthStore} from '@/store/authStore';
import AppLayout from '@/components/AppLayout';
import Avatar from '@/components/Avatar';
import {User, Mail, Calendar, Edit2, Save} from 'lucide-react';
import {formatDate} from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const router = useRouter();
    const {isAuthenticated, isInitialized, user, updateProfile, fetchProfile} = useAuthStore();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({first_name: '', last_name: '', bio: ''});

    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        if (user) {
            setFormData({first_name: user.first_name || '', last_name: user.last_name || '', bio: user.bio || ''});
        }
    }, [isAuthenticated, isInitialized, router, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile(formData);
            await fetchProfile();
            toast.success('Profile updated successfully!');
            setEditing(false);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <AppLayout>
                <div className='flex items-center justify-center h-[60vh]'>
                    <div className='w-12 h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 rounded-full animate-spin'></div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className='mb-10'>
                <h1 className='text-4xl font-black text-gray-900 dark:text-white mb-2'>
                    User <span className='text-gradient'>Profile</span>
                </h1>
                <p className='text-gray-600 dark:text-gray-400'>Manage your personal information and preferences</p>
            </div>

            <div className='glass-card p-0 overflow-hidden'>
                <div className='h-48 bg-gradient-to-br from-primary-600 via-secondary-600 to-accent-600 relative overflow-hidden'>
                    <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1)_0%,transparent_100%)]'></div>
                </div>

                <div className='px-10 pb-12'>
                    <div className='flex flex-col md:flex-row md:items-end justify-between -mt-20 mb-12 gap-6'>
                        <div className='flex flex-col md:flex-row items-start md:items-end gap-6'>
                            <div className='relative'>
                                <div className='w-40 h-40 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl flex items-center justify-center border-8 border-white dark:border-gray-800 overflow-hidden'>
                                    {user.profile_picture ? (
                                        <img
                                            src={user.profile_picture}
                                            alt={user.username}
                                            className='w-full h-full object-cover'
                                        />
                                    ) : (
                                        <Avatar
                                            seed={user.username || user.email}
                                            size='xl'
                                        />
                                    )}
                                </div>
                            </div>
                            <div className='mb-4'>
                                <h1 className='text-3xl font-black text-gray-900 dark:text-white mb-1'>{user.username}</h1>
                                <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium text-sm'>
                                    <Mail className='h-4 w-4' />
                                    <span className='truncate'>{user.email}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setEditing(!editing)}
                            className={`btn-${editing ? 'secondary' : 'primary'} !py-3.5 !px-6 flex items-center gap-2 mb-4`}
                        >
                            {editing ? (
                                <>
                                    <Save className='h-4 w-4' />
                                    Cancel
                                </>
                            ) : (
                                <>
                                    <Edit2 className='h-4 w-4' />
                                    Edit Profile
                                </>
                            )}
                        </button>
                    </div>

                    {editing ? (
                        <form
                            onSubmit={handleSubmit}
                            className='space-y-8'
                        >
                            <div className='grid md:grid-cols-2 gap-8'>
                                <div>
                                    <label className='block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2'>
                                        First Name
                                    </label>
                                    <input
                                        type='text'
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                        className='input-field'
                                    />
                                </div>
                                <div>
                                    <label className='block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2'>
                                        Last Name
                                    </label>
                                    <input
                                        type='text'
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                        className='input-field'
                                    />
                                </div>
                            </div>
                            <div>
                                <label className='block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2'>Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                    rows={4}
                                    className='input-field'
                                    placeholder='Tell us about yourself...'
                                />
                            </div>
                            <button
                                type='submit'
                                disabled={loading}
                                className='btn-primary !py-4 px-10 flex items-center gap-2'
                            >
                                <Save className='h-5 w-5' />
                                <span>{loading ? 'Saving...' : 'Save Profile'}</span>
                            </button>
                        </form>
                    ) : (
                        <div className='space-y-12'>
                            <div className='grid md:grid-cols-2 gap-x-12 gap-y-8'>
                                {[
                                    {label: 'First Name', value: user.first_name, icon: User},
                                    {label: 'Last Name', value: user.last_name, icon: User},
                                    {label: 'Email', value: user.email, icon: Mail},
                                    {label: 'Member Since', value: formatDate(user.date_joined), icon: Calendar},
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className='flex items-center gap-4'
                                    >
                                        <div className='p-3 bg-gray-100 dark:bg-white/5 rounded-xl'>
                                            <item.icon className='h-5 w-5 text-gray-400' />
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-xs font-bold uppercase tracking-wider text-gray-400 mb-0.5'>{item.label}</p>
                                            <p className='text-lg font-bold text-gray-900 dark:text-white truncate'>{item.value || '—'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {user.bio && (
                                <div className='p-8 glass rounded-2xl'>
                                    <h2 className='text-sm font-bold uppercase tracking-wider text-gray-400 mb-4'>Bio</h2>
                                    <p className='text-gray-600 dark:text-gray-300 leading-relaxed'>{user.bio}</p>
                                </div>
                            )}

                            {user.roles && user.roles.length > 0 && (
                                <div>
                                    <h2 className='text-sm font-bold uppercase tracking-wider text-gray-400 mb-6'>Roles</h2>
                                    <div className='grid sm:grid-cols-2 gap-4'>
                                        {user.roles.map((role, index) => (
                                            <div
                                                key={index}
                                                className='flex items-center justify-between p-5 glass rounded-xl'
                                            >
                                                <span className='font-bold text-gray-900 dark:text-white truncate'>{role.org}</span>
                                                <span className='px-4 py-1.5 bg-primary-100 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase rounded-lg'>
                                                    {role.role}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
