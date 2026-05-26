import './globals.css';
import { ThemeProvider } from './context/ThemeContext';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
    title: 'Campus Quest',
    description: 'TU Dublin Adventure',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" data-theme="dark">
            <body>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
                <Analytics />
            </body>
        </html>
    );
}
