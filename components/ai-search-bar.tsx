"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Sparkles, ExternalLink } from "lucide-react"

export function AISearchBar() {
  const [query, setQuery] = useState("")

  const handleSearch = () => {
    if (query.trim()) {
      // Open Perplexity search in new tab
      const perplexityUrl = `https://www.perplexity.ai/search?q=${encodeURIComponent(query)}`
      window.open(perplexityUrl, "_blank", "noopener,noreferrer")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="relative w-full">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Ask AI anything about these topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-12 rounded-xl border-border/50 bg-card pl-12 pr-4 text-base shadow-sm transition-all focus:shadow-md focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Button
          onClick={handleSearch}
          size="lg"
          className="h-12 rounded-xl bg-gradient-to-r from-primary to-accent px-6 font-medium shadow-sm transition-all hover:shadow-lg hover:shadow-primary/25"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          AI Search
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Powered by Perplexity AI - Get instant answers with sources</p>
    </div>
  )
}
