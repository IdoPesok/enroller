import { Toaster } from "@/components/ui/toaster"
import "@/styles/globals.css"
import type { AppProps, AppType } from "next/app"
import { ClerkLoaded, ClerkLoading, ClerkProvider } from "@clerk/nextjs"
import { LoadingPage } from "@/components/loading/loading-page"
import { trpc } from "@/lib/trpc"
import { Layout } from "@/components/layout"

const MyApp: AppType = ({ Component, pageProps }: AppProps) => {
  return (
    <ClerkProvider>
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
