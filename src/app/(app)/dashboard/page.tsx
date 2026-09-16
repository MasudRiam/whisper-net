'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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
import { Loader2, Trash2, Copy, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Page = () => {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [profileUrl, setProfileUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  const { setValue, watch }= useForm({
    resolver: zodResolver(acceptMessageValidation),
  })

  const acceptMessage = watch('acceptmessage')

  const initializeDashboard = useCallback(async () => {
    if (!session?.user) return
    const username = (session.user as User).username

    const baseUrl = `${window.location.protocol}//${window.location.host}`
    setProfileUrl(`${baseUrl}/profile/${username}`)

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
      setValue('acceptmessage', response.data.isAcceptingMessage ?? false)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message ?? 'Failed to fetch message status')
    } finally {
      setIsSwitching(false)
    }
  }, [session, setValue])

  useEffect(() => {
    if (session?.user) {
      initializeDashboard()
    }
  }, [session, initializeDashboard])

  const handleSwitchChange = async () => {
    try {
      await axios.post('/api/accept-message', {
        isAcceptingMessage: !acceptMessage,
      })
      setValue('acceptmessage', !acceptMessage)
      toast.success('Message acceptance status updated successfully')
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message ?? 'Failed to update status')
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await axios.delete(`/api/delete-message/${messageId}`)
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId))
      toast.success('Message deleted successfully')
    } catch {
      toast.error('Failed to delete message')
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
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(profileUrl);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = profileUrl;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    toast.success("Copied to clipboard!");
  } catch (err) {
    toast.error("Could not copy link.");
  }
};


  return (
    <div className="p-6 space-y-10 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight">User Dashboard</h1>

      <Card className="shadow-md border-none">
        <CardContent className="pt-6 space-y-6">
          <div>
            <p className="text-lg font-semibold mb-1">🔗 Your Unique Link</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Input
                readOnly
                value={profileUrl}
                className="focus-visible:ring-2 ring-blue-500 transition-all duration-200"
                placeholder={profileUrl ? '' : 'Your profile link is loading...'}
              />
              <Button onClick={copyToClipboard} className="w-full sm:w-auto">
                <Copy className="h-4 w-4 mr-1" />
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
              />
              <span className="text-sm font-medium text-muted-foreground">
                Accept Messages:{' '}
                <span className={`font-semibold ${acceptMessage ? 'text-green-600' : 'text-red-500'}`}>
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

      {messages.length === 0 ? (
        <p className="text-muted-foreground text-center text-sm">
          You haven’t received any messages yet.
        </p>
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
                <Card className="relative group shadow-sm hover:shadow-md transition-shadow duration-200 border border-border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={() => handleDeleteMessage(message._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <CardContent className="pt-6 pb-2 min-h-[100px]">
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
