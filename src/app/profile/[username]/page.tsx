'use client';

import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner'
import * as z from 'zod';
import { useParams } from 'next/navigation';
import { messageValidation } from '@/schemas/messageSchema';
import { ApiResponse } from '@/type/apiResponse';
import { CardHeader, CardContent, Card } from '@/components/ui/card';


const specialChar = '||';

const parseStringMessages = (messageString: string): string[] => {
    return messageString.split(specialChar).map(msg => msg.trim()).filter(Boolean);
};



const Page = () => {
    const [aiMessages, setAiMessages] = useState<string[]>([]);
    const [messageLoading, setMessageLoading] = useState(false);

    const params = useParams<{ username: string }>();
    const rawUsername = params.username;
    const username = rawUsername ? decodeURIComponent(rawUsername) : "";

    const form = useForm<z.infer<typeof messageValidation>>({
        resolver: zodResolver(messageValidation),
        defaultValues: { content: "" },
    });


    const messageContent = form.watch('content');
    const [isLoading, setIsLoading] = useState(false);

        const onSubmit = async (data: z.infer<typeof messageValidation>) => {
        setIsLoading(true);
        try {
            const response = await axios.post<ApiResponse>('/api/send-message', {
                username,
                ...data,
            });
            toast.success(response.data.message, {
                description: 'Your anonymous message was sent.',
            });
            form.reset({ content: '' });
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
                toast.error(axiosError.response?.data.message ?? 'Failed to send message', {
                description: 'Something went wrong while sending the message.',
                })
        } finally {
            setIsLoading(false);
        }
    };


        const fetchSuggestedMessages = async () => {
        setMessageLoading(true);
        try {
            const response = await axios.post('/api/suggest-messages');
            const messageString = response.data.message as string;
            const parsedMessages = parseStringMessages(messageString);
            setAiMessages(parsedMessages);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to fetch suggestions', {
                description: 'There was an error while fetching suggested messages.',
            });
        } finally {
            setMessageLoading(false);
        }
    };

    const handleMessageClick = (message: string) => {
        form.setValue('content', message, { shouldValidate: true, shouldDirty: true });
    };


 return (
        <div className="container mx-auto my-8 p-6 bg-card text-card-foreground rounded-lg border shadow-sm max-w-4xl min-h-[calc(100vh-8rem)]">
            <h1 className="text-4xl font-bold mb-2 text-center">
                Send an anonymous message
            </h1>
            <p className="text-center text-muted-foreground mb-6">
              to @{username || "..."}
            </p>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Send Anonymous Message to @{username}</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Write your anonymous message here (max 300 characters)"
                                        className="resize-none min-h-[120px]"
                                        maxLength={300}
                                        {...field}
                                    />
                                </FormControl>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <FormMessage />
                                  <span aria-live="polite">{messageContent?.length ?? 0}/300</span>
                                </div>
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-center w-full">
                        <Button
                            className="w-full"
                            type="submit"
                            disabled={isLoading || !messageContent?.trim()}
                        >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              "Send message"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>

            <div className="space-y-4 my-8 mt-10">
                <Card>
                    <CardHeader className="text-center text-xl font-semibold">
                        Need inspiration? Click a suggestion to use it.
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        {messageLoading ? (
                          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-4">
                            <Loader2 className="h-4 w-4 animate-spin" /> Generating suggestions...
                          </p>
                        ) : aiMessages.length > 0 ? (
                            aiMessages.map((message, index) => (
                                <Button
                                    key={`${index}-${message.slice(0, 20)}`}
                                    variant="outline"
                                    className='h-auto min-h-12 w-full whitespace-normal break-words text-left justify-start px-4 py-3'
                                    onClick={() => handleMessageClick(message)}
                                >
                                    {message}
                                </Button>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-sm text-center py-2">No suggestions yet. Click &quot;Suggest Messages&quot; below.</p>
                        )}
                    </CardContent>
                </Card>
                <div className="w-full">
                    <Button
                        onClick={fetchSuggestedMessages}
                        className="my-4 w-full"
                        variant="secondary"
                        disabled={messageLoading}
                    >
                        {messageLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Suggesting...
                          </>
                        ) : (
                          "Suggest Messages"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Page
