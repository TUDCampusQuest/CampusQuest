import './globals.css';

export const metadata = {
  title: 'Campus Quest',
  description: 'TU Dublin Adventure',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* We removed the Google Script tag from here */}
        {children}
      </body>
    </html>
  );
}