'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { useEffect, useState } from 'react'
import { useDebounceValue } from 'usehooks-ts'
import axios, {AxiosError} from 'axios'
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import { LoaderCircle } from 'lucide-react'
import { signUpValidation } from '@/schemas/signUpSchema'
import { ApiResponse } from '@/type/apiResponse'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const Page = () => {
  const [usernameInput, setUsernameInput] = useState('')
  const [debouncedUsername] = useDebounceValue(usernameInput, 500)
  const [usernameMessage, setUsernameMessage] = useState('')
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()

  const form = useForm<z.infer<typeof signUpValidation>> ({
    resolver: zodResolver(signUpValidation),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  })


  useEffect (() => {
    let cancelled = false;
    const checkUsernameUnique = async () => {
      if (!debouncedUsername) {
        setUsernameMessage('')
        setIsUsernameAvailable(null)
        return
      }
      setIsCheckingUsername (true)
      setUsernameMessage('')
        try {
        const res = await axios.get(`/api/check-username-unique?username=${encodeURIComponent(debouncedUsername)}`)
        if (cancelled) return;
        const message = res.data.message;

        setUsernameMessage(message)
        setIsUsernameAvailable(true)
        } catch (error) {
          if (cancelled) return;
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(axiosError.response?.data.message ?? 'Username is not available.');
          setIsUsernameAvailable(false)
        } finally {
          if (!cancelled) setIsCheckingUsername(false)
        }
    }
    checkUsernameUnique()
    return () => { cancelled = true }
  }, [debouncedUsername])


  const onSubmit = async (data: z.infer<typeof signUpValidation>) => {
    setIsSubmitting(true)
    try {
      const res = await axios.post('/api/sign-up', data)
      toast.success(res.data.message)
      router.push(`/verify/${encodeURIComponent(data.username)}`)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? 'An error occurred during sign up.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex justify-center items-center min-h-[calc(100vh-4rem)] bg-background px-4 py-10'>
      <div className='w-full max-w-md p-8 space-y-8 bg-card text-card-foreground rounded-lg shadow-md border'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold tracking-tight lg:text-4xl mb-3'>Join WhisperNet</h1>
          <p className='text-muted-foreground'>Create an account to start messaging</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
          name="username"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Choose a username" autoComplete="username" {...field}
                onChange={(e) => {
                  field.onChange(e)
                  setUsernameInput(e.target.value);
                }}
                />
              </FormControl>
                <div aria-live="polite" role="status" className="min-h-[1.25rem]">
                  {isCheckingUsername && (
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <LoaderCircle className="h-4 w-4 animate-spin" /> Checking username...
                    </span>
                  )}
                  {!isCheckingUsername && usernameMessage && (
                    <p className={`text-sm ${isUsernameAvailable ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>{usernameMessage}</p>
                  )}
                </div>
              <FormMessage />
            </FormItem>
          )}
        />


        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" autoComplete="email" {...field}
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
                <Input type='password' placeholder="At least 6 characters" autoComplete="new-password" {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting || isCheckingUsername}>
          {
            isSubmitting ? (
              <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Please wait...
              </>
            ) : ('Sign Up')
          }
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => router.push('/sign-in')}
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </button>
        </p>
          </form>
        </Form>

      </div>

    </div>
  )
}
export default Page
