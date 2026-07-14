import { ConfigProvider } from '@/features/settings/context/ConfigContext';
import { SoundProvider } from '@/features/sound/context/SoundContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/styles/globals.css';
import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { Sora, Roboto_Mono } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
});

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return (
    <SessionProvider session={session}>
      <main className={`${sora.className} ${robotoMono.variable}`}>
        <ErrorBoundary>
          <ConfigProvider>
            <SoundProvider>
              <Component {...pageProps} />
            </SoundProvider>
          </ConfigProvider>
        </ErrorBoundary>
      </main>
    </SessionProvider>
  );
}
