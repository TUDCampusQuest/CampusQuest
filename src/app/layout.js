import './globals.css';

export const metadata = {
    title: 'CampusQuest',
    description: 'CampusQuest',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <body>{children}</body>
        </html>
    );
}