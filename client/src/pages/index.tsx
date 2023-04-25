import { useState } from "react"
import { Dialog } from "@headlessui/react"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import { AcademicCapIcon } from "@heroicons/react/24/solid"
import Head from "next/head"
import { SignInButton, useAuth, useClerk, UserButton } from "@clerk/clerk-react"
import { ArrowRightCircle } from "lucide-react"

const navigation = [
  { name: "Salmon Labs", href: "" },
  { name: "Course Search", href: "/courses" },
]

export default function Home() {
  const { userId } = useAuth()
  const { signOut } = useClerk()

  return (
    <>
      <Head>
        <title>Enroller - Making Enrollment Better</title>
      </Head>
      <div className="mb-8 flex justify-center">
        <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
          Brought to you by Cal Poly students.{" "}
        </div>
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Class enrollment <br />
          done better.
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Enrolling in classes is a pain. We&apos;re here to make it easier.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          {userId ? (
            <a className="cursor-pointer rounded-md bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 flex gap-2 items-center">
              You are logged in - Go to portal
              <ArrowRightCircle size="16" />
            </a>
          ) : (
            <SignInButton mode="redirect">
              <a className="cursor-pointer rounded-md bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">
                Get started
              </a>
            </SignInButton>
          )}
        </div>
      </div>
    </>
  )
}
