'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import messages from "@/messages.json"
import Autoplay from 'embla-carousel-autoplay'


const Home = () => {
  const autoplay = useMemo(
    () =>
      Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true }),
    []
  );
  const year = new Date().getFullYear();

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col items-center justify-center gap-10 p-6 md:p-12">

      <section className="flex flex-col items-center text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">WhisperNet — Anonymous Messaging</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">Create your profile link, share it anywhere, and receive honest anonymous messages.</p>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button asChild size="lg">
            <Link href="/sign-up">Get started — it&apos;s free</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/sign-in">Sign in to dashboard</Link>
          </Button>
        </div>
      </section>

      <section aria-label="Sample messages" className="w-full max-w-2xl">
        <Carousel
          plugins={[autoplay]}
          className="w-full"
          opts={{ loop: true }}
        >
          <CarouselContent>
            {messages.map((item) => (
              <CarouselItem key={item.title} className="w-full">
                <Card className="bg-card text-card-foreground shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-muted-foreground">{item.content}</p>
                    <span className="block text-sm text-muted-foreground">{item.received}</span>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 md:-left-12" aria-label="Previous messages" />
          <CarouselNext className="right-2 md:-right-12" aria-label="Next messages" />
        </Carousel>
      </section>

      <footer className="text-sm text-muted-foreground">
        © {year} WhisperNet. All rights reserved.
      </footer>

    </main>
  );
}

export default Home;
