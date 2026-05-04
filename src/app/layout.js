import './globals.css';
import { ThemeProvider } from './context/ThemeContext';

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
            </body>
        </html>
    );
}
