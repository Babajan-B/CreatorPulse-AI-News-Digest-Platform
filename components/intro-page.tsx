"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Zap, Brain, TrendingUp } from "lucide-react"

const quotes = [
  {
    text: "The future belongs to those who understand AI",
    author: "CreatorPulse",
    icon: Brain,
  },
  {
    text: "Stay ahead with curated AI insights",
    author: "CreatorPulse",
    icon: TrendingUp,
  },
  {
    text: "Intelligence amplified, knowledge simplified",
    author: "CreatorPulse",
    icon: Zap,
  },
]

export function IntroPage({ onComplete }: { onComplete: () => void }) {
  const [currentQuote, setCurrentQuote] = useState(0)
  const [showLogo, setShowLogo] = useState(true)
  const [userClicked, setUserClicked] = useState(false)

  const handleClick = () => {
    if (!userClicked) {
      setUserClicked(true)
    }

    if (showLogo) {
      setShowLogo(false)
    } else if (currentQuote < quotes.length - 1) {
      setCurrentQuote((prev) => prev + 1)
    } else {
      onComplete()
    }
  }

  const CurrentIcon = quotes[currentQuote]?.icon || Sparkles

  return (
    <div
      className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-gradient-to-br from-background via-background to-primary/5"
      onClick={handleClick}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <p className="animate-pulse text-sm text-muted-foreground">Click anywhere to continue</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {showLogo ? (
          <motion.div
            key="logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
              }}
              className="relative"
            >
              <div className="absolute inset-0 animate-pulse rounded-3xl bg-gradient-to-br from-primary via-accent to-primary opacity-50 blur-2xl" />
              <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-primary via-accent to-primary shadow-2xl">
                <Sparkles className="h-16 w-16 text-primary-foreground" strokeWidth={2.5} />
              </div>
            </motion.div>

            {/* Brand Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-center"
            >
              <h1 className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-6xl font-bold tracking-tight text-transparent">
                CreatorPulse
              </h1>
              <p className="mt-3 text-base font-medium text-muted-foreground">AI Intelligence Hub</p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key={`quote-${currentQuote}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl px-8 text-center"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="mb-8 flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br from-primary/30 via-accent/30 to-primary/30 blur-xl" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-accent to-primary shadow-lg">
                  <Sparkles className="h-10 w-10 text-primary-foreground" strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>

            {/* Quote Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6 flex justify-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
                <CurrentIcon className="h-8 w-8 text-primary" />
              </div>
            </motion.div>

            {/* Quote Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
            >
              {quotes[currentQuote]?.text}
            </motion.p>

            {/* Author */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 text-sm font-medium text-muted-foreground"
            >
              — {quotes[currentQuote]?.author}
            </motion.p>

            {/* Progress Dots */}
            <div className="mt-8 flex justify-center gap-2">
              {quotes.map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.8, opacity: 0.3 }}
                  animate={{
                    scale: index === currentQuote ? 1.2 : 0.8,
                    opacity: index === currentQuote ? 1 : 0.3,
                  }}
                  className={`h-2 w-2 rounded-full ${index === currentQuote ? "bg-primary" : "bg-muted-foreground"}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
