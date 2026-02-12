import './globals.css';

export const metadata = {
    title: 'Campus Quest',
    description: 'TU Dublin Adventure',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <body>
        {children}
        </body>
        </html>
    );
}