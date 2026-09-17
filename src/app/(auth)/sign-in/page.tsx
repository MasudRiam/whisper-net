'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { signInValidation } from '@/schemas/signInSchema'
import { signIn } from 'next-auth/react'



//all coming from api/auth/[...nextauth]
// signIn is a function from next-auth that allows you to sign in users with different providers
const Page = () => {

  const router = useRouter()
  const { status } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard")
    }
  }, [status, router])

  const form = useForm<z.infer<typeof signInValidation>> ({
    resolver: zodResolver(signInValidation),
    defaultValues: {
      identifier: '',
      password: '',
    },
  })


  const onSubmit = async (data: z.infer<typeof signInValidation>) => {
      setIsSubmitting(true)
      try {
        const result = await signIn ('credentials', {
          identifier: data.identifier,
          password: data.password,
          redirect: false,
        })

        if (result?.error) {
          toast.error('Login failed', {
            description: result.error
          })
          return
        }
        if (result?.ok) {
          toast.success("Welcome back!")
          router.replace ('/dashboard')
        } else {
          toast.error("Login failed", {
            description: "Unexpected response, please try again."
          })
        }
      } finally {
        setIsSubmitting(false)
      }
  }


  return (
    <div className='flex justify-center items-center min-h-[calc(100vh-4rem)] bg-background px-4 py-10'>
      <div className='w-full max-w-md p-8 space-y-8 bg-card text-card-foreground rounded-lg shadow-md border'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold tracking-tight lg:text-4xl mb-3'>Welcome back</h1>
          <p className='text-muted-foreground'>Sign in to your WhisperNet account</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>

        <FormField
          name="identifier"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email/Username</FormLabel>
              <FormControl>
                <Input placeholder="Email or username" autoComplete="username" {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type='password' placeholder="Your password" autoComplete="current-password" {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
          <div className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
           
           
            <p className="text-sm text-center text-muted-foreground">
  Don’t have an account?{' '}
  <button
    type="button"
    onClick={() => router.push('/sign-up')}
    className="text-primary font-medium hover:underline"
  >
    Register here
  </button>
</p>
            </div>
          </form>
        </Form>

      </div>

    </div>
  )
}
export default Page
