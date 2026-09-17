'use client'

import React, { useState } from 'react'

import {
  Card,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { ApiResponse } from '@/type/apiResponse'
import { Message } from '@/model/User'

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
}

const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await axios.delete<ApiResponse>(`/api/delete-message/${message._id}`)
      toast.success("Message deleted", {
        description: response.data.message,
        duration: 3000,
      })
      onMessageDelete(message._id)
    } catch {
      toast.error("Delete failed", {
        description: "Something went wrong while deleting.",
        duration: 3000,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
            <CardDescription className="mt-2">{new Date(message.createdAt).toLocaleString()}</CardDescription>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
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
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Continue"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
    </Card>
  )
}

export default MessageCard
