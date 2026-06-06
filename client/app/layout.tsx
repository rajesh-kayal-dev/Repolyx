import type { Metadata } from 'next';
import { Inter, Orbitron } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' });

export const metadata: Metadata = {
    title: 'Repolyx | Repository Intelligence',
    description: 'AI-powered GitHub repository intelligence platform for engineering teams.',
    icons: {
        icon: '/Repolyx.png',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`dark scroll-smooth ${inter.variable} ${orbitron.variable}`}>
            <body className="font-sans">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
