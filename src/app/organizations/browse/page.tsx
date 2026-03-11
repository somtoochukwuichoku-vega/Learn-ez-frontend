'use client';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAuthStore} from '@/store/authStore';
import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';
import {Organization} from '@/types';
import {Building2, Users, Globe, CheckCircle, Search, Sparkles} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BrowseOrganizationsPage() {
    const router = useRouter();
    const {isAuthenticated, isInitialized} = useAuthStore();
    const [publicOrgs, setPublicOrgs] = useState<Organization[]>([]);
    const [myOrgs, setMyOrgs] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [enrolling, setEnrolling] = useState<string | null>(null);

    useEffect(() => {
        if (!isInitialized) return;
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchOrganizations();
    }, [isAuthenticated, isInitialized, router]);

    const fetchOrganizations = async () => {
        try {
            // Fetch user's organizations and all public organizations
            const [myOrgsRes, publicOrgsRes] = await Promise.all([api.get('/auth/organizations/'), api.get('/auth/organizations/explore/')]);

            const myOrgsList = Array.isArray(myOrgsRes.data) ? myOrgsRes.data : myOrgsRes.data.results || [];
            const publicOrgsList = Array.isArray(publicOrgsRes.data) ? publicOrgsRes.data : publicOrgsRes.data.results || [];

            console.log('=== ORGANIZATIONS DEBUG ===');
            console.log('My organizations:', myOrgsList.length);
            console.log('Public organizations:', publicOrgsList.length);
            console.log('=========================');

            setMyOrgs(myOrgsList);
            setPublicOrgs(publicOrgsList);
        } catch (error) {
            console.error('Error fetching organizations:', error);
            toast.error('Failed to load organizations');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinOrganization = async (orgId: string) => {
        setEnrolling(orgId);
        try {
            await api.post(`/auth/org/${orgId}/enroll/`);
            toast.success('Successfully joined organization!');
            router.push(`/organizations/${orgId}`);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to join organization');
        } finally {
            setEnrolling(null);
        }
    };

    const filteredOrgs = publicOrgs.filter((org) => org?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!isInitialized || loading) {
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
            <div className='space-y-8'>
                <div>
                    <div className='inline-flex items-center gap-2 glass px-5 py-2.5 rounded-full mb-4'>
                        <Sparkles className='h-4 w-4 text-primary-600 dark:text-primary-400' />
                        <span className='text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400'>Explore</span>
                    </div>
                    <h1 className='text-4xl font-black text-gray-900 dark:text-white mb-2'>
                        Discover <span className='text-gradient'>Organizations</span>
                    </h1>
                    <p className='text-gray-600 dark:text-gray-400'>Find and join public learning communities</p>
                </div>
                <div className='glass-card p-6'>
                    <div className='relative'>
                        <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                        <input
                            type='text'
                            placeholder='Search organizations...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='input-field pl-12'
                        />
                    </div>
                </div>
                {filteredOrgs.length > 0 ? (
                    <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {filteredOrgs.map((org) => {
                            const isMember = myOrgs.some((myOrg) => myOrg.id === org.id);
                            return (
                                <div
                                    key={org.id}
                                    className='glass-card group'
                                >
                                    <div className='flex items-start justify-between mb-4'>
                                        <div className='w-14 h-14 bg-primary-900 dark:bg-primary-800 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform'>
                                            <Building2 className='h-7 w-7 text-white' />
                                        </div>
                                        <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success-100 dark:bg-success-950/50 text-success-700 dark:text-success-300 text-xs font-bold'>
                                            <Globe className='h-3.5 w-3.5' />
                                            Public
                                        </div>
                                    </div>
                                    <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-3 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors'>
                                        {org.name}
                                    </h3>
                                    <div className='flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6'>
                                        <Users className='h-4 w-4' />
                                        <span>{org.member_count || 0} members</span>
                                    </div>
                                    {isMember ? (
                                        <button
                                            onClick={() => router.push(`/organizations/${org.id}`)}
                                            className='w-full btn-primary !py-3 flex items-center justify-center gap-2'
                                        >
                                            <CheckCircle className='h-4 w-4' />
                                            View Dashboard
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleJoinOrganization(org.id)}
                                            disabled={enrolling === org.id}
                                            className='w-full btn-secondary !py-3 disabled:opacity-50'
                                        >
                                            {enrolling === org.id ? 'Joining...' : 'Join Now'}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className='glass-card p-16 text-center'>
                        <div className='w-20 h-20 bg-gray-100 dark:bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6'>
                            <Building2 className='h-10 w-10 text-gray-400' />
                        </div>
                        <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>No organizations found</h3>
                        <p className='text-gray-600 dark:text-gray-400'>
                            {searchTerm ? 'Try a different search term' : 'No public organizations available yet'}
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
