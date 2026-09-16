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
  const user = session?.user as User

    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = theme === "dark"

  return (
    <nav className='p-4 md:p-6 shadow-md'>
        <div className='container mx-auto flex flex-col md:flex-row justify-between items-center'>
            <a className='text-xl font-bold mb-4 md:mb-0' href="#">True Message</a>
            { session ? (
                <>
                <span className='mr-4'>Welcome {user?.name || user?.email}</span>
                <button className='w-full md:w-auto px-6 py-2 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105' onClick={() => signOut()}>Sign Out</button>
                </>
            ): (
                <Link href='/sign-in'>
                    <button className='w-full md:w-auto px-6 py-2 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105'>Sign In</button>
                </Link>
            )}
                {mounted && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="transition-all"
            >
              {isDark ? (
                <SunMedium className="h-5 w-5 text-yellow-400" />
              ) : (
                <MoonStar className="h-5 w-5 text-blue-900" />
              )}
            </Button>
                )}
        </div>
    </nav>
  )
}

export default Navbar