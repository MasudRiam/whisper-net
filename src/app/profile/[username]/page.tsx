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
    return messageString.split(specialChar).map(msg => msg.trim()); // Split and trim any extra spaces
};




const Page = () => {
    const [aiMessages, setAiMessages] = useState<string[]>([]);
    const [MessageLoading, setMessageLoading] = useState(false);

    const params = useParams<{ username: string }>();
    const username = params.username;

    const form = useForm<z.infer<typeof messageValidation>>({
        resolver: zodResolver(messageValidation),
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
            toast(response.data.message, {
                description: 'Your message was received.',
            });
            form.reset({ ...form.getValues(), content: '' });
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
        try {
            setMessageLoading(true);
            const response = await axios.post('/api/suggest-messages');
            const messageString = response.data.message;
            const parsedMessages = parseStringMessages(messageString);
            setAiMessages(parsedMessages);
            setMessageLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to fetch messages', {
                description: 'There was an error while fetching suggested messages.',
            });
        }
    };

    const handleMessageClick = (message: string) => {
        form.setValue('content', message);
    };


 return (
        <div className="container mx-auto my-8 p-6 relative bg-gray-100 rounded max-w-4xl h-screen dark:bg-gray-950">
            <h1 className="text-4xl font-bold mb-6 text-center">
                Public Profile Link
            </h1>
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
                                        placeholder="Write your anonymous message here"
                                        className="resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-center w-full">
                        {isLoading ? (
                            <Button className='w-full' disabled>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please wait
                            </Button>
                        ) : (
                            <Button
                                className={`
                                    w-full
                                    px-4 py-2
                                    text-white
                                    font-semibold
                                    rounded-xl
                                    bg-gradient-to-r from-blue-500 to-indigo-600
                                    hover:from-blue-600 hover:to-indigo-700
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    shadow-md
                                    transition duration-300 ease-in-out
                                `}
                                type="submit"
                                disabled={isLoading || !messageContent}
                                >
                                {isLoading ? 'Sending...' : '🚀 Send It'}
                            </Button>
                        )}
                    </div>
                </form>
            </Form>

            <div className="space-y-4 my-8 mt-10">
                <Card className="dark:bg-black border-none">
                    <CardHeader className="text-center text-2xl font-semibold">
                        Click on any message below to select it.
                    </CardHeader>
                    <CardContent className="flex flex-col space-y-2 max-sm:space-y-4">

                        {aiMessages.length > 0 ? (
                            aiMessages.map((message, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    className='w-full text-wrap max-sm:h-16'
                                    onClick={() => handleMessageClick(message)}
                                >
                                    {message}
                                </Button>
                            ))
                        ) : (
                            <p className="text-gray-500">No messages available. Try suggesting some!</p>
                        )}
                    </CardContent>
                </Card>
                <div className="space-y-2 w-full">
                    {isLoading ? (
                        <Button disabled className="my-4 w-full text-white bg-blue-700 hover:bg-blue-800">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Suggesting
                        </Button>
                    ) : (
                        <Button
                            onClick={fetchSuggestedMessages}
                            className="my-4 w-full text-white bg-blue-700 hover:bg-blue-800"
                            disabled={isLoading}
                        >
                            Suggest Messages
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Page
