'use client'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { verifyValidation } from '@/schemas/verifySchema'
import { ApiResponse } from '@/type/apiResponse'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

const Page = () => {
    const router = useRouter()
    const params = useParams()
    const username = params.username as string;

    const form = useForm<z.infer<typeof verifyValidation>> ({
        resolver: zodResolver(verifyValidation),
        defaultValues: {
            code: '',
        }
      })
    
    const onSubmit = async (data: z.infer<typeof verifyValidation>) => {
        try {

              if (!username) {
              toast.error("Username is missing in the URL");
              return;
            }

            const response = await axios.post<ApiResponse>('/api/verify-code', {
                username: decodeURIComponent(username),
                code: data.code
            })

        toast.success("Success", {
        description: response.data.message
        })
        router.replace('/sign-in')


        } catch (error) {
          console.log ("Error occurred while verifying code:", error);
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message ?? 'An error occurred during sign up.')
            
        }
    }

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-950'>
        <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:text-white'>
            <div className='text-center'>
                <h1 className='text-3xl font-bold tracking-tight lg:text-5xl mb-6'>Verify Your Account</h1>
                <p className='mb-4 text-2xl'>Enter the verification code sent to your email</p>
            </div>

            <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          name="code"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-lg'>Verification Code</FormLabel>
              <FormControl>
                <Input placeholder="Enter your code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>

        </div>
    </div>

  )
}

export default Page