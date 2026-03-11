'use client';

import {useEffect, useState} from 'react';
import api from '@/lib/api';
import {UserPlus, CheckCircle, Clock} from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from './Avatar';

interface PendingMember {
    membership_id: string;
    user_email: string;
    requested_at: string;
}

interface MemberManagementProps {
    orgId: string;
}

export default function MemberManagement({orgId}: MemberManagementProps) {
    const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [emailToAdd, setEmailToAdd] = useState('');
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        fetchPendingMembers();
    }, [orgId]);

    const fetchPendingMembers = async () => {
        try {
            const response = await api.get(`/auth/org/${orgId}/manage-members/`);
            setPendingMembers(response.data);
        } catch (error) {
            toast.error('Failed to load pending members');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveMember = async (membershipId: string) => {
        setProcessing(membershipId);
        try {
            await api.post(`/auth/org/${orgId}/manage-members/`, {
                membership_id: membershipId
            });
            toast.success('Member approved!');
            fetchPendingMembers();
        } catch (error: any) {
            toast.error('Failed to approve member');
        } finally {
            setProcessing(null);
        }
    };

    const handleAddMemberByEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing('add');
        try {
            await api.post(`/auth/org/${orgId}/manage-members/`, {
                email: emailToAdd
            });
            toast.success('Member added!');
            setShowAddModal(false);
            setEmailToAdd('');
        } catch (error: any) {
            toast.error('Failed to add member');
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return <div className='flex justify-center py-12'><div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div></div>;
    }

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <h2 className='text-2xl font-black text-slate-900 dark:text-white'>Member Management</h2>
                <button onClick={() => setShowAddModal(true)} className='btn-primary flex items-center gap-2'>
                    <UserPlus className='h-4 w-4' />Add Member
                </button>
            </div>

            {pendingMembers.length > 0 ? (
                <div className='space-y-4'>
                    <h3 className='text-lg font-bold flex items-center gap-2'>
                        <Clock className='h-5 w-5 text-yellow-500' />Pending ({pendingMembers.length})
                    </h3>
                    {pendingMembers.map((member) => (
                        <div key={member.membership_id} className='glass-card p-6 flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                                <Avatar fallback={member.user_email.charAt(0)} size='md' />
                                <div>
                                    <p className='font-bold'>{member.user_email}</p>
                                    <p className='text-sm text-slate-500'>Requested {new Date(member.requested_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button onClick={() => handleApproveMember(member.membership_id)} disabled={processing === member.membership_id} className='px-4 py-2 bg-green-500 text-white rounded-lg font-bold'>
                                <CheckCircle className='h-4 w-4 inline mr-2' />Approve
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='glass-card p-12 text-center'>
                    <CheckCircle className='h-16 w-16 text-slate-300 mx-auto mb-4' />
                    <h3 className='text-lg font-bold mb-2'>All caught up!</h3>
                    <p className='text-slate-600 dark:text-slate-400'>No pending requests</p>
                </div>
            )}

            {showAddModal && (
                <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
                    <div className='glass rounded-2xl w-full max-w-md p-8'>
                        <h2 className='text-2xl font-black mb-6'>Add Member</h2>
                        <form onSubmit={handleAddMemberByEmail}>
                            <input type='email' required value={emailToAdd} onChange={(e) => setEmailToAdd(e.target.value)} className='w-full px-4 py-3 mb-6 bg-slate-50 dark:bg-slate-900 border rounded-xl' placeholder='member@example.com' />
                            <div className='flex gap-3'>
                                <button type='button' onClick={() => setShowAddModal(false)} className='flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold'>Cancel</button>
                                <button type='submit' disabled={processing === 'add'} className='flex-1 btn-primary'>{processing === 'add' ? 'Adding...' : 'Add'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
