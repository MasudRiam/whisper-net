'use client'

import React from 'react'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { ApiResponse } from '@/type/apiResponse'
import { Message } from '@/model/User'

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
}

const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {

  const handleDelete = async () => {
    try {
      const response = await axios.delete<ApiResponse>(`/api/delete-message/${message._id}`)
      toast("Delete Done", {
        description: response.data.message,
        duration: 3000,
      })
      onMessageDelete(message._id)
    } catch (error) {
      toast("Error", {
        description: "Something went wrong while deleting.",
        duration: 3000,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{message.content}</CardTitle>
            <CardDescription>{new Date(message.createdAt).toLocaleString()}</CardDescription>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the message. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Continue
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
