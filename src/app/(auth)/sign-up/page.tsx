'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { useEffect, useState } from 'react'
import { useDebounceCallback } from 'usehooks-ts'
import axios, {AxiosError} from 'axios'
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import { LoaderCircle } from 'lucide-react'
import { signUpValidation } from '@/schemas/signUpSchema'
import { ApiResponse } from '@/type/apiResponse'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const Page = () => {
  const [ username, setUsername ] = useState('')
  const [ usernameMessage, setUsernameMessage ] = useState('')
  const [ isCheckingUsername, setIsCheckingUsername ] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

 const debounced = useDebounceCallback(setUsername, 500)

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
    const checkUsernameUniqe = async () => {
      if (username) {
        setIsCheckingUsername (true)
        setUsernameMessage('')
          try {
          const res = await axios.get(`/api/check-username-unique?username=${username}`)
          const message = res.data.message;

          setUsernameMessage(message)
          } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            setUsernameMessage(axiosError.response?.data.message ?? 'Username is not available.');
          } finally {
            setIsCheckingUsername(false)
          }
      }
    }
    checkUsernameUniqe()
  }, [username])


  const onSubmit = async (data: z.infer<typeof signUpValidation>) => {
    setIsSubmitting(true)
    try {
      const res = await axios.post('/api/sign-up', data)
      toast.success(res.data.message)
      router.push (`/verify/${encodeURIComponent(username)}`)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? 'An error occurred during sign up.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-950'>
      <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:text-white'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold tracking-tight lg:text-5xl mb-6'>Join True Message</h1>
          <p className='mb-4'>Create an account to start messaging</p>
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
                <Input placeholder="username" {...field}
                onChange={(e) => {
                  field.onChange(e)
                    setUsername(e.target.value);
                  debounced(e.target.value)
                }}
                />
              </FormControl>
                {isCheckingUsername && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                <p className={`text-sm ${usernameMessage === 'Valid username' ? 'text-green-500' : 'text-red-500'}`}>{usernameMessage}</p>
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
                <Input placeholder="email" {...field}
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
                <Input type='password' placeholder="password" {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {
            isSubmitting ? (
              <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              </>
            ) : ('Sign Up')
          }
        </Button>
          </form>
        </Form>

      </div>

    </div>
  )
}
export default Page