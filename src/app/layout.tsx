import type { Metadata } from 'next';
import { Nunito, Roboto_Mono } from 'next/font/google';
import './globals.css';

const nunito = Nunito({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

export const metadata: Metadata = {
  title: 'PUBG Board',
  description: 'A platform for PUBG players to track their stats and performances',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${robotoMono.variable}`}>
      <body className={nunito.className}>
        {children}
      </body>
    </html>
  );
}