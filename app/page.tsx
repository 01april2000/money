"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { User } from "@/components/user";
import { LogoutButton } from "@/components/logout-button";
import { useSession } from "@/lib/auth-client"


export default function Home() {
  const { data: session, isPending } = useSession()
  const role = session?.user ? (session.user as any)?.role : undefined
  const router = useRouter()

  console.log("User role:", role)

  useEffect(() => {
    if (!isPending && session) {
      switch (role) {
        case "BENDAHARA_SMK":
          router.push("/bendahara-smk")
          break
        case "ADMIN":
          router.push("/admin")
          break
        case "SANTRI":
          router.push("/santri")
          break
        default:
          // If no role or unknown role, stay on home page
          break
      }
    }
  }, [session, isPending, role, router])
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="absolute top-4 right-4 flex gap-2">
          <LogoutButton />
          <ThemeToggle />
        </div>
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Welcome to Money App
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            This is a test page for authentication. The User component below displays your session data.
          </p>
        </div>
        <div className="flex flex-col gap-4 items-center w-full">
          <User />
        </div>
      </main>
    </div>
  );
}
