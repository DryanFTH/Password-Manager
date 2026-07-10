import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/providers/query-provider';
import { GridBackground } from '@/components/ui/GridBackground';

const nunito = Nunito({
    variable: '--font-nunito',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Password Manager',
    description: 'Zero-knowledge password manager',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`h-full antialiased`}>
            <body className={`relative ${nunito.variable} min-h-full flex flex-col`}>
                <GridBackground />
                <QueryProvider>{children}</QueryProvider>
            </body>
        </html>
    );
}
