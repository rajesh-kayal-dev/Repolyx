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
        icon: { url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHJ4PSI2IiBmaWxsPSJ1cmwoI2ZhdmdyYWQpIi8+PHRleHQgeD0iNyIgeT0iMTciIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSI3MDAiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0ic3lzdGVtLXVpIj5SPC90ZXh0PjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZmF2Z3JhZCIgeDE9IjAiIHkxPSIwIiB4Mj0iMjQiIHkyPSIyNCI+PHN0b3Agc3RvcC1jb2xvcj0iIzA2YjZkNCIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzYzNjZmMSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg==', type: 'image/svg+xml' },
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
