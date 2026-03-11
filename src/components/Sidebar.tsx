'use client';

import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {useAuthStore} from '@/store/authStore';
import {LayoutDashboard, BookOpen, FileText, Building2, User, LogOut, Moon, Sun, GraduationCap, Menu, X, Globe} from 'lucide-react';
import {useEffect, useState} from 'react';
import Avatar from './Avatar';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const {user, logout} = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const [theme, setTheme] = useState('light');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        }
        const savedCollapse = localStorage.getItem('sidebar-collapsed');
        if (savedCollapse === 'true') setIsCollapsed(true);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebar-collapsed', String(newState));
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const menuItems = [
        {icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard'},
        {icon: BookOpen, label: 'Courses', href: '/courses'},
        {icon: FileText, label: 'Assignments', href: '/assignments'},
        {icon: Building2, label: 'Organizations', href: '/organizations'},
        {icon: Globe, label: 'Discover', href: '/organizations/browse'},
        {icon: User, label: 'Profile', href: '/profile'},
    ];

    if (!mounted) return null;

    const sidebarContent = (
        <>
            <div className='flex items-center justify-between mb-8 px-2'>
                {!isCollapsed && (
                    <div className='flex items-center gap-2'>
                        <div className='w-9 h-9 bg-primary-900 dark:bg-primary-800 rounded-xl flex items-center justify-center shadow-lg'>
                            <GraduationCap className='h-5 w-5 text-white' />
                        </div>
                        <span className='text-lg font-bold text-white'>Learn-EZ</span>
                    </div>
                )}
                {!isCollapsed && (
                    <button
                        onClick={toggleCollapse}
                        className='p-2 rounded-lg hover:bg-white/10 transition-colors lg:block hidden'
                    >
                        <X className='h-5 w-5 text-white' />
                    </button>
                )}
            </div>
            {!isCollapsed && (
                <div className='mb-6 px-2'>
                    <div className='bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-xl p-3 flex items-center gap-3 border border-white/20 dark:border-white/10 hover:bg-white/15 dark:hover:bg-white/10 transition-all duration-200'>
                        <Avatar
                            seed={user?.username || user?.email}
                            size='md'
                        />
                        <div className='flex-1 min-w-0'>
                            <p className='text-sm font-semibold text-white truncate'>{user?.username}</p>
                            <p className='text-xs text-primary-200 dark:text-primary-300 truncate'>{user?.email}</p>
                        </div>
                    </div>
                </div>
            )}
            {isCollapsed && (
                <div className='mb-6 px-2 flex justify-center'>
                    <Avatar
                        seed={user?.username || user?.email}
                        size='md'
                    />
                </div>
            )}
            <nav className='flex-1 space-y-1 px-2'>
                {!isCollapsed && <p className='text-xs uppercase tracking-wider font-bold text-gray-400 mb-3 px-2'>Menu</p>}
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary-700 dark:bg-primary-800 text-white shadow-lg' : 'text-white hover:bg-white/10'} ${isCollapsed ? 'justify-center' : ''}`}
                            title={isCollapsed ? item.label : ''}
                        >
                            <Icon className='h-5 w-5 flex-shrink-0' />
                            {!isCollapsed && <span className='font-medium text-sm truncate'>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>
            <div className='space-y-1 pt-4 mt-4 border-t border-white/10 px-2'>
                <button
                    onClick={toggleTheme}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-white hover:bg-white/10 transition-all duration-200 w-full ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? (theme === 'light' ? 'Dark Mode' : 'Light Mode') : ''}
                >
                    {theme === 'light' ? <Moon className='h-5 w-5 flex-shrink-0' /> : <Sun className='h-5 w-5 flex-shrink-0' />}
                    {!isCollapsed && <span className='font-medium text-sm'>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
                </button>
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? 'Logout' : ''}
                >
                    <LogOut className='h-5 w-5 flex-shrink-0' />
                    {!isCollapsed && <span className='font-medium text-sm'>Logout</span>}
                </button>
            </div>
        </>
    );

    return (
        <>
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className='lg:hidden fixed top-4 left-4 z-50 p-3 bg-primary-900 dark:bg-primary-800 rounded-xl shadow-lg text-white'
            >
                <Menu className='h-6 w-6' />
            </button>
            {isMobileOpen && (
                <div
                    className='lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40'
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
            <aside
                className={`glass fixed left-0 top-0 h-screen py-6 flex-col border-r border-white/10 z-40 transition-all duration-300 bg-primary-900/95 dark:bg-primary-950/95 backdrop-blur-xl ${isCollapsed ? 'w-20 px-2 hidden lg:flex' : 'w-64 px-4 hidden lg:flex'}`}
            >
                {sidebarContent}
            </aside>
            {isCollapsed && (
                <button
                    onClick={toggleCollapse}
                    className='hidden lg:block fixed left-6 top-6 z-50 p-2 bg-primary-900 dark:bg-primary-800 rounded-lg hover:bg-primary-800 dark:hover:bg-primary-700 transition-colors shadow-lg'
                >
                    <Menu className='h-5 w-5 text-white' />
                </button>
            )}
            <aside
                className={`lg:hidden glass fixed left-0 top-0 h-screen w-64 py-6 px-4 flex flex-col border-r border-white/10 z-50 transition-transform duration-300 bg-primary-900/95 dark:bg-primary-950/95 backdrop-blur-xl ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {sidebarContent}
            </aside>
        </>
    );
}
