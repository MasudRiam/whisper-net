'use client'

import React, { useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  motion,
  MotionConfig,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'framer-motion'

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


const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

const steps = [
  {
    title: 'Create your link',
    content: 'Sign up in seconds and get your personal whisper link.',
  },
  {
    title: 'Share anywhere',
    content: 'Drop it in your bio, stories, or group chats.',
  },
  {
    title: 'Read honest whispers',
    content: 'Anonymous messages land in your dashboard instantly.',
  },
]

const Home = () => {
  const reduceMotion = useReducedMotion()
  const autoplay = useMemo(
    () =>
      Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true }),
    []
  );
  const year = new Date().getFullYear();

  const { scrollYProgress } = useScroll()
  const progressScaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.4,
  })

  const [glow, setGlow] = React.useState({ x: 50, y: 35 })
  const handleHeroMouse = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setGlow({ x, y })
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      {/* scroll progress */}
      <motion.div
        aria-hidden
        style={{ scaleX: reduceMotion ? 0 : progressScaleX }}
        className="fixed left-0 top-0 z-50 h-0.5 w-full origin-left bg-primary"
      />

      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col items-center justify-center gap-14 p-6 md:p-12">

        {/* HERO with cursor glow + floating bubbles */}
        <section
          onMouseMove={reduceMotion ? undefined : handleHeroMouse}
          className="relative flex w-full flex-col items-center overflow-hidden rounded-2xl border bg-card px-6 py-12 text-center md:py-16"
        >
          {/* cursor-following glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(320px circle at ${glow.x}% ${glow.y}%, hsl(var(--primary) / 0.12), transparent 65%)`,
            }}
          />
          {/* floating bubbles */}
          {!reduceMotion && (
            <>
              <motion.span
                aria-hidden
                animate={{ y: [0, -12, 0], rotate: [0, 6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-[8%] top-[18%] hidden rounded-full border bg-background/80 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur sm:block"
              >
                “you’re doing great 🤍”
              </motion.span>
              <motion.span
                aria-hidden
                animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                className="absolute right-[9%] top-[24%] hidden rounded-full border bg-background/80 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur sm:block"
              >
                “honest opinion? 🔥”
              </motion.span>
              <motion.span
                aria-hidden
                animate={{ y: [0, -9, 0] }}
                transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                className="absolute bottom-[16%] left-[14%] hidden rounded-full border bg-background/80 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur md:block"
              >
                “anonymous whisper…”
              </motion.span>
            </>
          )}

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="relative"
          >
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground">
              ✨ Anonymous • Honest • Fun
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="relative mt-4 max-w-2xl text-4xl md:text-5xl font-bold tracking-tight text-balance"
          >
            WhisperNet — Anonymous Messaging
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="relative text-lg text-muted-foreground max-w-2xl text-balance"
          >
            Create your profile link, share it anywhere, and receive honest anonymous messages.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="relative flex flex-col sm:flex-row gap-3 pt-4"
          >
            <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }}>
              <Button asChild size="lg" className="transition-shadow hover:shadow-lg">
                <Link href="/sign-up">Get started — it&apos;s free</Link>
              </Button>
            </motion.div>
            <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }}>
              <Button asChild variant="outline" size="lg" className="transition-shadow hover:shadow-md">
                <Link href="/sign-in">Sign in to dashboard</Link>
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* HOW IT WORKS — scroll reveal */}
        <section aria-label="How it works" className="w-full">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            custom={0}
            className="text-center"
          >
            <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
            <p className="mt-1 text-muted-foreground">Three steps, thirty seconds.</p>
          </motion.div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                custom={i}
                whileHover={reduceMotion ? undefined : { y: -4 }}
                className="rounded-xl border bg-card p-5 text-left shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.content}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SAMPLE MESSAGES */}
        <motion.section
          aria-label="Sample messages"
          className="w-full max-w-2xl"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          custom={0}
        >
          <Carousel
            plugins={[autoplay]}
            className="w-full"
            opts={{ loop: true }}
          >
            <CarouselContent>
              {messages.map((item) => (
                <CarouselItem key={item.title} className="w-full">
                  <motion.div
                    whileHover={reduceMotion ? undefined : { y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  >
                    <Card className="bg-card text-card-foreground shadow-md hover:shadow-lg transition-shadow duration-300">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-muted-foreground">{item.content}</p>
                        <span className="block text-sm text-muted-foreground">{item.received}</span>
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 md:-left-12 transition-transform active:scale-95" aria-label="Previous messages" />
            <CarouselNext className="right-2 md:-right-12 transition-transform active:scale-95" aria-label="Next messages" />
          </Carousel>
        </motion.section>

        <footer className="text-sm text-muted-foreground">
          © {year} WhisperNet. All rights reserved.
        </footer>

      </main>
    </MotionConfig>
  );
}

export default Home;
