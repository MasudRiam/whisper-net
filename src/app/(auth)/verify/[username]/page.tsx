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
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import * as z from 'zod'

const Page = () => {
    const router = useRouter()
    const params = useParams()
    const rawUsername = params.username as string | undefined;
    const username = rawUsername ? decodeURIComponent(rawUsername) : "";
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof verifyValidation>> ({
        resolver: zodResolver(verifyValidation),
        defaultValues: {
            code: '',
        }
      })
    
    const onSubmit = async (data: z.infer<typeof verifyValidation>) => {
        if (!username) {
          toast.error("Username is missing in the URL");
          return;
        }
        setIsSubmitting(true)
        try {
            const response = await axios.post<ApiResponse>('/api/verify-code', {
                username,
                code: data.code.trim()
            })

        toast.success("Verified", {
        description: response.data.message
        })
        router.replace('/sign-in')


        } catch (error) {
          console.log ("Error occurred while verifying code:", error);
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message ?? 'An error occurred during verification.')
            
        } finally {
          setIsSubmitting(false)
        }
    }

  return (
    <div className='flex justify-center items-center min-h-[calc(100vh-4rem)] bg-background px-4 py-10'>
        <div className='w-full max-w-md p-8 space-y-8 bg-card text-card-foreground rounded-lg shadow-md border'>
            <div className='text-center space-y-2'>
                <h1 className='text-2xl font-bold tracking-tight lg:text-4xl'>Verify Your Account</h1>
                <p className='text-muted-foreground'>Enter the 6-digit code sent to your email{username ? <> for <span className="font-semibold text-foreground">@{username}</span></> : ""}</p>
            </div>

            <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          name="code"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verification Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="123456"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  className="text-center tracking-[0.3em]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting || !username}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify account"
          )}
        </Button>
      </form>
    </Form>

        </div>
    </div>

  )
}

export default Page
