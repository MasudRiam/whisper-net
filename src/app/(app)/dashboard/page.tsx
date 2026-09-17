'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { acceptMessageValidation } from '@/schemas/acceptMessageSchema'
import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'
import { ApiResponse } from '@/type/apiResponse'
import { Message } from '@/model/User'
import { User } from 'next-auth'
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Trash2, Copy, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type AcceptForm = { acceptMessage: boolean }

const Page = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [profileUrl, setProfileUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSwitching, setIsSwitching] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { setValue, watch } = useForm<AcceptForm>({
    resolver: zodResolver(acceptMessageValidation.pick({ acceptMessage: true }) as unknown as never) as never,
    defaultValues: { acceptMessage: true },
  })

  const acceptMessage = watch('acceptMessage')

  const initializeDashboard = useCallback(async () => {
    if (!session?.user) return
    const username = (session.user as User).username
    if (!username) return

    const baseUrl = `${window.location.protocol}//${window.location.host}`
    setProfileUrl(`${baseUrl}/profile/${encodeURIComponent(username)}`)

    // Fetch messages
    try {
      setLoading(true)
      const response = await axios.get<ApiResponse>('/api/get-messages')
      setMessages(response.data.messages ?? [])
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message ?? 'Failed to fetch messages')
    } finally {
      setLoading(false)
    }

    // Fetch accept message status
    try {
      setIsSwitching(true)
      const response = await axios.get<ApiResponse>('/api/accept-message')
      setValue('acceptMessage', response.data.isAcceptingMessage ?? true)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message ?? 'Failed to fetch message status')
    } finally {
      setIsSwitching(false)
    }
  }, [session, setValue])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/sign-in')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      initializeDashboard()
    }
  }, [status, session, initializeDashboard])

  const handleSwitchChange = async (next: boolean) => {
    const prev = acceptMessage
    setValue('acceptMessage', next)
    try {
      setIsSwitching(true)
      await axios.post('/api/accept-message', {
        isAcceptingMessage: next,
      })
      toast.success(`Message acceptance turned ${next ? 'on' : 'off'}`)
    } catch (error) {
      setValue('acceptMessage', prev)
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message ?? 'Failed to update status')
    } finally {
      setIsSwitching(false)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    setDeletingId(messageId)
    try {
      await axios.delete(`/api/delete-message/${messageId}`)
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId))
      toast.success('Message deleted successfully')
    } catch {
      toast.error('Failed to delete message')
    } finally {
      setDeletingId(null)
    }
  }

  const handleRefresh = async () => {
    try {
      setLoading(true)
      const response = await axios.get<ApiResponse>('/api/get-messages')
      setMessages(response.data.messages ?? [])
      toast.success('Messages refreshed successfully', {
        description: 'Messages have been updated.',
      })
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message ?? 'Failed to fetch messages')
    } finally {
      setLoading(false)
    }
  }

const copyToClipboard = async () => {
  if (!profileUrl) {
    toast.error("Profile link is not ready yet.");
    return;
  }
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(profileUrl);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = profileUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    toast.success("Copied to clipboard!");
  } catch {
    toast.error("Could not copy link.");
  }
};

  if (status === 'loading') {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-36 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Redirecting to sign in...
      </div>
    )
  }

  return (
    <div className="p-6 space-y-10 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight">User Dashboard</h1>

      <Card className="shadow-md">
        <CardContent className="pt-6 space-y-6">
          <div>
            <p className="text-lg font-semibold mb-1">Your Unique Link</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Input
                readOnly
                value={profileUrl}
                className="transition-all duration-200"
                placeholder='Your profile link is loading...'
              />
              <Button onClick={copyToClipboard} disabled={!profileUrl} className="w-full sm:w-auto">
                <Copy className="h-4 w-4 mr-1" aria-hidden />
                Copy
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-3">
              <Switch
                checked={acceptMessage}
                onCheckedChange={handleSwitchChange}
                disabled={isSwitching}
                aria-label="Accept messages"
              />
              <span className="text-sm font-medium text-muted-foreground">
                Accept Messages:{' '}
                <span className={`font-semibold ${acceptMessage ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                  {acceptMessage ? 'On' : 'Off'}
                </span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Messages</h2>
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground text-sm">
            You haven&apos;t received any messages yet. Share your unique link to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="relative group shadow-sm hover:shadow-md transition-shadow duration-200">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete message"
                        className="absolute top-2 right-2 text-destructive opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 transition-opacity duration-200"
                        disabled={deletingId === message._id}
                      >
                        {deletingId === message._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this message?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the message. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteMessage(message._id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <CardContent className="pt-6 pb-2 min-h-[100px] pr-12">
                    <p className="text-sm text-foreground break-words whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </CardContent>

                  <CardFooter>
                    <span className="text-xs text-muted-foreground mt-2">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default Page
