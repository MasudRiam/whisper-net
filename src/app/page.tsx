'use client'

import React from 'react'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from '@/components/ui/card';

import messages from "@/messages.json"
import Autoplay from 'embla-carousel-autoplay'


const Home = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-12">

      <section className="flex flex-col items-center text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold">Welcome to KhalidIT Anonymous Messaging System</h1>
        <p className="text-lg text-muted-foreground">Your one-stop solution for anonymous messaging.</p>
      </section>

      <Carousel plugins={[Autoplay({ delay: 3000 })]} className="w-full max-w-2xl">
        <CarouselContent>
          {
            messages.map((messages, index) => (
              <CarouselItem key={index} className="w-full">
                <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 dark:text-white">
                  <CardContent className="p-6 space-y-4">
                    <h1 className="text-xl font-semibold text-card-foreground dark:text-white">{messages.title}</h1>
                    <p className="text-gray-700 dark:text-gray-300">{messages.content}</p>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{messages.received}</span>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))
          }
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <footer className="mt-12 text-sm text-muted-foreground">
        © 2025 KhalidIT. All rights reserved.
      </footer>

    </main>
  );
}

export default Home;