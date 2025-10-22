"use client"

import { useEffect, useState, useRef } from "react"
import { Youtube, Twitter, Linkedin, Facebook, Instagram, MessageCircle } from "lucide-react"

// Matrix rain character set (English only - AI/Tech themed)
const matrixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?"

// Social media icons component mapping
const socialIcons = [
  { Icon: Youtube, color: "#FF0000" },
  { Icon: Twitter, color: "#1DA1F2" },
  { Icon: Linkedin, color: "#0A66C2" },
  { Icon: Facebook, color: "#1877F2" },
  { Icon: Instagram, color: "#E4405F" },
  { Icon: MessageCircle, color: "#25D366" },
]

interface MatrixColumn {
  x: number
  y: number
  speed: number
  chars: string[]
  isSocialIcon: boolean
  iconIndex?: number
}

export function MatrixHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [displayText, setDisplayText] = useState("")
  const [showCaret, setShowCaret] = useState(true)
  const [animationComplete, setAnimationComplete] = useState(false)
  const hasAnimated = useRef(false)

  // Typing animation
  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) {
      setDisplayText("Curator+")
      setShowCaret(false)
      setAnimationComplete(true)
      return
    }

    const sequence = async () => {
      // Type "CuratorPlus"
      const fullText = "CuratorPlus"
      for (let i = 0; i <= fullText.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 80))
        setDisplayText(fullText.slice(0, i))
      }

      await new Promise((resolve) => setTimeout(resolve, 600))

      // Backspace "Plus"
      const backspaceSteps = ["CuratorPlu", "CuratorPl", "CuratorP", "Curator"]
      for (const step of backspaceSteps) {
        await new Promise((resolve) => setTimeout(resolve, 60))
        setDisplayText(step)
      }

      await new Promise((resolve) => setTimeout(resolve, 300))

      // Type "+"
      await new Promise((resolve) => setTimeout(resolve, 80))
      setDisplayText("Curator+")

      await new Promise((resolve) => setTimeout(resolve, 600))
      setShowCaret(false)
      setAnimationComplete(true)

      // Restart after 3 seconds
      await new Promise((resolve) => setTimeout(resolve, 3000))
      hasAnimated.current = false
      setDisplayText("")
      setShowCaret(true)
      setAnimationComplete(false)
    }

    sequence()
  }, [displayText, animationComplete])

  // Matrix rain animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()
    window.addEventListener("resize", setCanvasSize)

    const columns: MatrixColumn[] = []
    const columnWidth = 30
    const numColumns = Math.floor(canvas.width / columnWidth)

    // Initialize columns
    for (let i = 0; i < numColumns; i++) {
      const isSocialIcon = Math.random() > 0.7 // 30% chance of social icon
      columns.push({
        x: i * columnWidth,
        y: Math.random() * canvas.height * -1,
        speed: Math.random() * 2 + 1,
        chars: Array(20).fill("").map(() => 
          matrixChars[Math.floor(Math.random() * matrixChars.length)]
        ),
        isSocialIcon,
        iconIndex: isSocialIcon ? Math.floor(Math.random() * socialIcons.length) : undefined,
      })
    }

    let animationFrameId: number

    const draw = () => {
      // Fully transparent - no background fill, just clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      columns.forEach((column) => {
        if (column.isSocialIcon && column.iconIndex !== undefined) {
          // Draw social media icon placeholder (circle with color)
          const socialIcon = socialIcons[column.iconIndex]
          ctx.fillStyle = socialIcon.color
          ctx.globalAlpha = 0.6
          ctx.beginPath()
          ctx.arc(column.x + 15, column.y, 12, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1
        } else {
          // Draw matrix characters in RED
          column.chars.forEach((char, index) => {
            const y = column.y + index * 20
            if (y > 0 && y < canvas.height) {
              // Gradient effect - brighter at bottom (RED with better visibility)
              const alpha = (1 - (index / column.chars.length)) * 0.4 // Max 0.4 opacity for subtlety
              ctx.fillStyle = `rgba(227, 76, 45, ${alpha})`
              ctx.font = "16px monospace"
              ctx.fillText(char, column.x, y)
            }
          })
        }

        // Move column down
        column.y += column.speed

        // Reset when off screen
        if (column.y > canvas.height + 100) {
          column.y = -100
          column.speed = Math.random() * 2 + 1
          column.isSocialIcon = Math.random() > 0.7
          column.iconIndex = column.isSocialIcon 
            ? Math.floor(Math.random() * socialIcons.length) 
            : undefined
          
          // Randomize characters
          column.chars = Array(20).fill("").map(() => 
            matrixChars[Math.floor(Math.random() * matrixChars.length)]
          )
        }

        // Randomly change some characters
        if (Math.random() > 0.95) {
          const randomIndex = Math.floor(Math.random() * column.chars.length)
          column.chars[randomIndex] = matrixChars[Math.floor(Math.random() * matrixChars.length)]
        }
      })

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener("resize", setCanvasSize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FFF8F0]">
      {/* Matrix Rain Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
      />

      {/* Content Overlay */}
      <div className="relative z-10 text-center px-4">
        {/* Main Headline with Red Banner */}
        <div className="mb-8">
          <h1 
            className="inline-block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight"
            aria-label="Curator plus"
          >
            <span className="inline-block bg-gradient-to-r from-[#E34C2D] to-[#CC4328] px-6 py-3 text-white rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300">
              {displayText || "\u00A0"}
              {showCaret && (
                <span 
                  className="inline-block w-[0.08em] animate-blink bg-white ml-1"
                  aria-hidden="true"
                  style={{ height: "0.9em", verticalAlign: "middle" }}
                >
                  |
                </span>
              )}
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-2xl sm:text-3xl md:text-4xl font-light text-[#111111] mb-8 tracking-wide">
          AI — Curate as you create
        </p>

        {/* Social Media Icons Row */}
        <div className="flex justify-center items-center gap-6 mb-12">
          {socialIcons.map(({ Icon, color }, index) => (
            <div
              key={index}
              className="p-3 rounded-full bg-white backdrop-blur-sm hover:bg-[#F7C6D9] transition-all duration-300 hover:scale-110 cursor-pointer shadow-md"
              style={{ borderColor: color, borderWidth: 2 }}
            >
              <Icon className="w-6 h-6 sm:w-8 sm:h-8" style={{ color }} />
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button className="btn-primary px-10 py-5 text-xl font-bold rounded-xl transition-all duration-300 transform hover:scale-105">
          Get Started Free
        </button>

        {/* Stats/Features */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#E34C2D] mb-2">10+</div>
            <div className="text-[#111111]/70 text-sm">Social Platforms</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#E34C2D] mb-2">AI</div>
            <div className="text-[#111111]/70 text-sm">Powered Content</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#E34C2D] mb-2">24/7</div>
            <div className="text-[#111111]/70 text-sm">Auto Curation</div>
          </div>
        </div>
      </div>

      {/* Accessibility announcement */}
      {animationComplete && (
        <div className="sr-only" aria-live="polite">
          Curator plus becomes Curator plus sign
        </div>
      )}

      {/* Custom animation styles */}
      <style jsx>{`
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }

        .animate-blink {
          animation: blink 1s infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-blink {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
    </section>
  )
}

