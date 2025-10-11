"use client"

import { useRouter } from "next/navigation"
import { Brain, Microscope, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function SelectModePage() {
  const router = useRouter()

  const handleModeSelect = (mode: "ai_news" | "science_breakthrough") => {
    localStorage.setItem("preferred_mode", mode)
    if (mode === "ai_news") {
      router.push("/")
    } else {
      router.push("/science")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-10 w-10 text-yellow-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              CreatorPulse
            </h1>
          </div>
          <p className="text-2xl text-gray-300 font-medium">Choose your content focus</p>
        </div>

        {/* Mode Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* AI News Card */}
          <Card
            className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-0 overflow-hidden bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 p-0"
            onClick={() => handleModeSelect("ai_news")}
          >
            <div className="p-12 text-center text-white">
              <div className="flex items-center justify-center mb-6">
                <div className="p-6 bg-white/20 rounded-3xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <Brain className="h-20 w-20" />
                </div>
              </div>
              <h2 className="text-4xl font-bold mb-2">AI News</h2>
              <p className="text-xl text-white/90">
                Latest AI developments & tech breakthroughs
              </p>
            </div>
          </Card>

          {/* Science Breakthroughs Card */}
          <Card
            className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-0 overflow-hidden bg-gradient-to-br from-green-500 via-teal-600 to-emerald-700 p-0"
            onClick={() => handleModeSelect("science_breakthrough")}
          >
            <div className="p-12 text-center text-white">
              <div className="flex items-center justify-center mb-6">
                <div className="p-6 bg-white/20 rounded-3xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <Microscope className="h-20 w-20" />
                </div>
              </div>
              <h2 className="text-4xl font-bold mb-2">Science Breakthroughs</h2>
              <p className="text-xl text-white/90">
                Medical research & scientific discoveries
              </p>
            </div>
          </Card>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">You can change your preference anytime in settings</p>
        </div>
      </div>
    </div>
  )
}
