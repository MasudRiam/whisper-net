'use client'


import React, { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { User } from 'next-auth'
import Link from 'next/link'
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { MoonStar, SunMedium } from "lucide-react"

const Navbar = () => {
  const { data: session } = useSession()
  const user = session?.user as User | undefined

  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"
  const displayName = user?.username || user?.name || user?.email

  return (
    <nav className='sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-4 md:p-6'>
        <Link className='text-xl font-bold' href="/">WhisperNet</Link>
        <div className='flex flex-col gap-2 md:flex-row md:items-center md:gap-3'>
          {session ? (
            <>
              {displayName && (
                <span className='text-sm text-muted-foreground truncate max-w-[220px]'>Welcome, {displayName}</span>
              )}
              <Button
                className='w-full md:w-auto'
                onClick={() => signOut({ callbackUrl: "/sign-in" })}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button asChild className='w-full md:w-auto'>
              <Link href='/sign-in'>Sign In</Link>
            </Button>
          )}
          {mounted && (
            <Button
              variant="outline"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="transition-all self-start md:self-auto"
            >
              {isDark ? (
                <SunMedium className="h-5 w-5 text-yellow-400" />
              ) : (
                <MoonStar className="h-5 w-5 text-blue-900 dark:text-blue-200" />
              )}
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
