"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Filter, X } from "lucide-react"

interface TopicFilterProps {
  topics: string[]
  selectedTopic: string | null
  onTopicChange: (topic: string | null) => void
}

export function TopicFilter({ topics, selectedTopic, onTopicChange }: TopicFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const displayTopics = isExpanded ? topics : topics.slice(0, 8)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Filter by Technology</h3>
        </div>
        {selectedTopic && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTopicChange(null)}
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {displayTopics.map((topic) => (
          <Badge
            key={topic}
            variant={selectedTopic === topic ? "default" : "outline"}
            className={cn(
              "cursor-pointer px-3 py-1.5 text-sm font-medium transition-all hover:shadow-sm",
              selectedTopic === topic
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md hover:shadow-lg"
                : "hover:border-primary/50 hover:bg-primary/5",
            )}
            onClick={() => onTopicChange(selectedTopic === topic ? null : topic)}
          >
            {topic}
          </Badge>
        ))}
        {topics.length > 8 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? "Show Less" : `+${topics.length - 8} More`}
          </Button>
        )}
      </div>
    </div>
  )
}
