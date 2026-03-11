import type {Metadata} from 'next';
import './globals.css';
import {Toaster} from 'react-hot-toast';
import {ThemeProvider} from '@/components/ThemeProvider';

export const metadata: Metadata = {
    title: 'Learn-EZ - Your Learning Management System',
    description: 'A comprehensive LMS platform for online learning',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang='en'
            suppressHydrationWarning
        >
            <body
                className='font-sans antialiased min-h-screen'
                suppressHydrationWarning
            >
                <ThemeProvider>
                    {children}
                    <Toaster
                        position='top-right'
                        toastOptions={{
                            className: 'glass',
                            style: {
                                background: 'rgba(255, 255, 255, 0.7)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                            },
                        }}
                    />
                </ThemeProvider>
            </body>
        </html>
    );
}
