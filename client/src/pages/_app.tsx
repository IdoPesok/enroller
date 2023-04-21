import { Toaster } from '@/components/ui/toaster'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ClerkLoaded, ClerkLoading, ClerkProvider } from '@clerk/nextjs';
import { LoadingPage } from '@/components/loading/loading-page';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider>
      <ClerkLoading>
        <LoadingPage />
      </ClerkLoading>
      <ClerkLoaded>
        <Component {...pageProps} />
        <Toaster />
      </ClerkLoaded>
    </ClerkProvider>
  )
}
