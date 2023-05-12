import { Toaster } from "@/components/ui/toaster"
import "@/styles/globals.css"
import type { AppProps, AppType } from "next/app"
import { ClerkLoaded, ClerkLoading, ClerkProvider } from "@clerk/nextjs"
import { LoadingPage } from "@/components/loading/loading-page"
import { trpc } from "@/lib/trpc"
import { Layout } from "@/components/layout"
import ProgressBar from "@badrap/bar-of-progress"
import { useRouter } from "next/router"
import { useEffect } from "react"

const progress = new ProgressBar({
  size: 4,
  color: "#10b981",
  className: "bar-of-progress",
  delay: 100,
});

const MyApp: AppType = ({ Component, pageProps }: AppProps) => {
  const router = useRouter()

  useEffect(() => {
    const handleStart = () => {
      progress.start()
    }

    const handleStop = () => {
      progress.finish()
    }

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleStop)
    router.events.on('routeChangeError', handleStop)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleStop)
      router.events.off('routeChangeError', handleStop)
    }
  }, [router])

  return (
    <ClerkProvider publishableKey="pk_test_c3VpdGFibGUtcHJpbWF0ZS0xNy5jbGVyay5hY2NvdW50cy5kZXYk">
      <ClerkLoading>
        <LoadingPage />
      </ClerkLoading>
      <ClerkLoaded>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <Toaster />
      </ClerkLoaded>
    </ClerkProvider>
  )
}

export default trpc.withTRPC(MyApp)
