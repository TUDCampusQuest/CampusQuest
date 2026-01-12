import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'Campus Quest',
  description: 'TU Dublin Adventure',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Google Maps Script */}
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
          strategy="afterInteractive"
        />

        {children}
      </body>
    </html>
  );
}
