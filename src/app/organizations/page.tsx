'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAuthStore} from '@/store/authStore';
import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';
import {Organization} from '@/types';
import {Building2, Users, Plus, Calendar, Sparkles, Target, ArrowRight} from 'lucide-react';
import {formatDate} from '@/lib/utils';
import toast from 'react-hot-toast';

export default function OrganizationsPage() {
    const router = useRouter();
    const {isAuthenticated, isInitialized, user} = useAuthStore();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [newOrgName, setNewOrgName] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [joinOrgId, setJoinOrgId] = useState('');
    const [creating, setCreating] = useState(false);
    const [joining, setJoining] = useState(false);
    const [publicOrgs, setPublicOrgs] = useState<Organization[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'created' | 'joined'>('all');

    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        fetchOrganizations();
    }, [isAuthenticated, router]);

    const fetchOrganizations = async () => {
        try {
            const response = await api.get('/auth/organizations/');
            console.log('Organizations API response:', response.data);

            // Handle paginated response
            const orgsList = Array.isArray(response.data) ? response.data : response.data.results || [];

            console.log('Extracted organizations:', orgsList);
            console.log('Current user ID:', user?.id);
            console.log(
                'Organization creators:',
                orgsList.map((org: Organization) => ({
                    name: org.name,
                    creator: org.creator,
                    isCreator: org.creator === user?.id,
                })),
            );
            setOrganizations(orgsList);
        } catch (error) {
            console.error('Error fetching organizations:', error);
            toast.error('Failed to load organizations');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrganization = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        try {
            await api.post('/auth/organizations/', {
                name: newOrgName,
                is_public: isPublic,
            });
            toast.success(`Organization created successfully! ${isPublic ? '(Public)' : '(Private)'}`);
            setShowCreateModal(false);
            setNewOrgName('');
            setIsPublic(false);
            fetchOrganizations();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to create organization');
        } finally {
            setCreating(false);
        }
    };

    // Filter organizations based on active tab
    const createdOrgs = organizations.filter((org) => org.creator === user?.id);
    const joinedOrgs = organizations.filter((org) => org.creator !== user?.id);

    const displayedOrgs = activeTab === 'created' ? createdOrgs : activeTab === 'joined' ? joinedOrgs : organizations;

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
            <div className='mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6'>
                <div>
                    <div className='inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-4 animate-float'>
                        <Building2 className='h-4 w-4 text-accent-purple' />
                        <span className='text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400'>Network Hub</span>
                    </div>
                    <h1 className='text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight'>
                        Learning <span className='text-gradient'>Organizations</span>
                    </h1>
                    <p className='text-slate-500 dark:text-slate-400 font-medium'>Manage and collaborate within your educational networks</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className='btn-primary flex items-center gap-2'
                >
                    <Plus className='h-5 w-5' />
                    New Organization
                </button>
            </div>

            {/* Filter Tabs */}
            {organizations.length > 0 && (
                <div className='flex gap-3 mb-8 overflow-x-auto pb-2'>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                            activeTab === 'all'
                                ? 'bg-primary-900 text-white shadow-lg shadow-primary-900/30'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                        }`}
                    >
                        All Organizations ({organizations.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('created')}
                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                            activeTab === 'created'
                                ? 'bg-primary-900 text-white shadow-lg shadow-primary-900/30'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                        }`}
                    >
                        <Sparkles className='h-4 w-4' />
                        My Organizations ({createdOrgs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('joined')}
                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                            activeTab === 'joined'
                                ? 'bg-primary-900 text-white shadow-lg shadow-primary-900/30'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                        }`}
                    >
                        <Users className='h-4 w-4' />
                        Joined ({joinedOrgs.length})
                    </button>
                </div>
            )}

            {displayedOrgs.length > 0 ? (
                <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
                    {displayedOrgs.map((org) => {
                        const isCreator = org.creator === user?.id;
                        return (
                            <div
                                key={org.id}
                                className='glass-card group border border-white/20 dark:border-white/5 card-glow relative'
                                onClick={() => router.push(`/organizations/${org.id}`)}
                            >
                                {/* Creator Badge */}
                                {isCreator && (
                                    <div className='absolute top-4 right-4 z-10'>
                                        <div className='flex items-center gap-1.5 px-3 py-1.5 bg-secondary-500 text-white rounded-full shadow-lg'>
                                            <Sparkles className='h-3 w-3' />
                                            <span className='text-[10px] font-black uppercase tracking-wider'>Owner</span>
                                        </div>
                                    </div>
                                )}

                                <div className='w-14 h-14 bg-primary-900 dark:bg-primary-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-900/20 group-hover:scale-110 transition-transform'>
                                    <Building2 className='h-7 w-7 text-white' />
                                </div>

                                <h3 className='text-2xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors tracking-tight'>
                                    {org.name}
                                </h3>

                                <div className='flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8'>
                                    <div className='flex items-center gap-1.5'>
                                        <Calendar className='h-4 w-4' />
                                        <span>
                                            {isCreator ? 'Created' : 'Joined'} {formatDate(org.created_at)}
                                        </span>
                                    </div>
                                </div>

                                <button className='w-full py-3.5 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-2xl group-hover:bg-primary-900 group-hover:text-white transition-all font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-primary-900/30'>
                                    View Dashboard
                                    <ArrowRight className='h-4 w-4' />
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className='glass-card p-16 text-center border-dashed border-2'>
                    <div className='w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6'>
                        <Building2 className='h-10 w-10 text-slate-300' />
                    </div>
                    <h3 className='text-2xl font-black text-slate-900 dark:text-white mb-2'>
                        {activeTab === 'created'
                            ? 'No organizations created yet'
                            : activeTab === 'joined'
                              ? 'No joined organizations yet'
                              : 'No organizations yet'}
                    </h3>
                    <p className='text-slate-500 dark:text-slate-400 font-medium mb-8'>
                        {activeTab === 'created'
                            ? 'Create your first organization to start collaborating!'
                            : activeTab === 'joined'
                              ? 'Browse and join organizations to get started!'
                              : 'Create or join an organization to get started!'}
                    </p>
                    {activeTab !== 'joined' && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className='btn-primary flex items-center gap-2'
                        >
                            <Plus className='h-5 w-5' />
                            <span>Create Organization</span>
                        </button>
                    )}
                </div>
            )}

            {/* Create Organization Modal */}
            {showCreateModal && (
                <div className='fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300'>
                    <div className='glass-card max-w-md w-full p-10 border border-white/20 shadow-2xl animate-in zoom-in-95 duration-300'>
                        <div className='flex items-center gap-3 mb-8'>
                            <div className='p-3 bg-primary-500/10 dark:bg-primary-500/20 rounded-2xl'>
                                <Target className='h-6 w-6 text-primary-600 dark:text-primary-400' />
                            </div>
                            <h2 className='text-2xl font-black text-slate-900 dark:text-white tracking-tight'>New Organization</h2>
                        </div>

                        <form onSubmit={handleCreateOrganization}>
                            <div className='mb-6'>
                                <label className='block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2'>
                                    Organization Name
                                </label>
                                <input
                                    type='text'
                                    required
                                    value={newOrgName}
                                    onChange={(e) => setNewOrgName(e.target.value)}
                                    className='w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary-900 focus:border-transparent outline-none font-bold text-slate-900 dark:text-white'
                                    placeholder='Ex: Global Tech Academy'
                                />
                            </div>

                            <div className='mb-8'>
                                <label className='block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3'>
                                    Visibility
                                </label>
                                <div className='space-y-3'>
                                    <label className='flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!isPublic ? "border-primary-900 bg-primary-50 dark:bg-primary-900/10" : "border-slate-200 dark:border-slate-700"}'>
                                        <input
                                            type='radio'
                                            name='visibility'
                                            checked={!isPublic}
                                            onChange={() => setIsPublic(false)}
                                            className='mt-1 w-5 h-5 text-primary-900 focus:ring-primary-900'
                                        />
                                        <div className='flex-1'>
                                            <div className='font-bold text-slate-900 dark:text-white mb-1'>Private</div>
                                            <div className='text-xs text-slate-600 dark:text-slate-400'>
                                                Users must request to join and wait for admin approval
                                            </div>
                                        </div>
                                    </label>

                                    <label className='flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isPublic ? "border-primary-900 bg-primary-50 dark:bg-primary-900/10" : "border-slate-200 dark:border-slate-700"}'>
                                        <input
                                            type='radio'
                                            name='visibility'
                                            checked={isPublic}
                                            onChange={() => setIsPublic(true)}
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
                            </div>

                            <div className='flex gap-4'>
                                <button
                                    type='button'
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setNewOrgName('');
                                        setIsPublic(false);
                                    }}
                                    className='flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition font-black uppercase tracking-widest text-xs'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    disabled={creating}
                                    className='flex-1 btn-primary text-xs tracking-widest uppercase !py-4'
                                >
                                    {creating ? 'Creating...' : 'Create Org'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
