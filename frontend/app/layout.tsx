import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MediScanAI',
  description: 'World-class futuristic healthcare intelligence platform',
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
