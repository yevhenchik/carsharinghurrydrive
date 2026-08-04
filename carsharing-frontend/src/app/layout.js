import { Inter, Barlow_Condensed, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../lib/auth';
import Header from '../components/Header';
import Footer from '../components/Footer';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' });
const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-barlow-condensed',
});
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono' });

export const metadata = {
  title: 'HURRYDRIVE — оренда авто',
  description: 'Каршерінг нового покоління: обери авто, заброньюй, забирай.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body className={`${inter.variable} ${barlow.variable} ${plexMono.variable}`}>
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
