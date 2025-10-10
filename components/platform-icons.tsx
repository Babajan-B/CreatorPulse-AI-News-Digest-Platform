"use client"

import Image from "next/image"

const sources = [
  { name: "TechCrunch", logo: "/logos/techcrunch.svg", text: "TechCrunch" },
  { name: "MIT News", logo: "/logos/mit.svg", text: "MIT News" },
  { name: "Google AI", logo: "/logos/google.svg", text: "Google AI" },
  { name: "NVIDIA", logo: "/logos/nvidia.svg", text: "NVIDIA" },
  { name: "OpenAI", logo: "/logos/openai.svg", text: "OpenAI" },
  { name: "DeepMind", logo: "/logos/deepmind.svg", text: "DeepMind" },
  { name: "Microsoft AI", logo: "/logos/microsoft.svg", text: "Microsoft AI" },
  { name: "Hugging Face", logo: "/logos/huggingface.svg", text: "Hugging Face" },
  { name: "Anthropic", logo: "/logos/anthropic.svg", text: "Anthropic" },
  { name: "Papers with Code", logo: "/logos/paperswithcode.svg", text: "Papers with Code" },
  { name: "Towards Data Science", logo: "/logos/tds.svg", text: "Towards Data Science" },
  { name: "Analytics Vidhya", logo: "/logos/analyticsvidhya.svg", text: "Analytics Vidhya" },
  { name: "The Gradient", logo: "/logos/gradient.svg", text: "The Gradient" },
  { name: "MarkTechPost", logo: "/logos/marktechpost.svg", text: "MarkTechPost" },
  { name: "AI Trends", logo: "/logos/aitrends.svg", text: "AI Trends" },
  { name: "Machine Learning Mastery", logo: "/logos/mlmastery.svg", text: "ML Mastery" },
  { name: "AIwire", logo: "/logos/aiwire.svg", text: "AIwire" },
  { name: "AI Blog", logo: "/logos/aiblog.svg", text: "AI Blog" },
  { name: "Stability AI", logo: "/logos/stability.svg", text: "Stability AI" }
]

export function PlatformIcons() {
  // Duplicate sources for seamless loop
  const duplicatedSources = [...sources, ...sources, ...sources]

  return (
    <div className="w-full py-8">
      {/* Scrolling Sources Animation */}
      <div className="relative overflow-hidden">
        <div className="flex animate-scroll whitespace-nowrap items-center">
          {duplicatedSources.map((source, index) => (
            <div
              key={`${source.name}-${index}`}
              className="mx-6 flex items-center gap-3 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-300"
            >
              {/* Logo */}
              <div className="w-8 h-8 flex items-center justify-center">
                {source.logo ? (
                  <Image
                    src={source.logo}
                    alt={source.name}
                    width={32}
                    height={32}
                    className="w-full h-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
                  />
                ) : (
                  <div className="w-8 h-8 bg-muted-foreground/20 rounded flex items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      {source.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Text */}
              <span className="text-lg font-medium text-muted-foreground whitespace-nowrap">
                {source.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}