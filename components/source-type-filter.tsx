"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Filter, X, Rss, Youtube, Twitter } from "lucide-react"

interface SourceTypeFilterProps {
  sourceTypes: string[]
  selectedSourceType: string | null
  onSourceTypeChange: (sourceType: string | null) => void
  customSourcesCount?: Record<string, number>
}

const sourceTypeIcons = {
  rss: Rss,
  youtube: Youtube,
  twitter: Twitter,
}

const sourceTypeLabels = {
  rss: "RSS Feeds",
  youtube: "YouTube",
  twitter: "Twitter/X",
}

export function SourceTypeFilter({ 
  sourceTypes, 
  selectedSourceType, 
  onSourceTypeChange,
  customSourcesCount = {}
}: SourceTypeFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const displaySourceTypes = isExpanded ? sourceTypes : sourceTypes.slice(0, 6)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Filter by Source Type</h3>
        </div>
        {selectedSourceType && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSourceTypeChange(null)}
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {displaySourceTypes.map((sourceType) => {
          const Icon = sourceTypeIcons[sourceType as keyof typeof sourceTypeIcons]
          const label = sourceTypeLabels[sourceType as keyof typeof sourceTypeLabels] || sourceType
          const count = customSourcesCount[sourceType] || 0
          
          return (
            <Badge
              key={sourceType}
              variant={selectedSourceType === sourceType ? "default" : "outline"}
              className={cn(
                "cursor-pointer px-3 py-1.5 text-sm font-medium transition-all hover:shadow-sm flex items-center gap-1.5",
                selectedSourceType === sourceType
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md hover:shadow-lg"
                  : "hover:border-primary/50 hover:bg-primary/5",
                count === 0 && "opacity-60"
              )}
              onClick={() => onSourceTypeChange(selectedSourceType === sourceType ? null : sourceType)}
            >
              {Icon && <Icon className="h-3 w-3" />}
              <span>{label}</span>
              {count > 0 ? (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                  {count}
                </span>
              ) : (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
                  0
                </span>
              )}
            </Badge>
          )
        })}
        {sourceTypes.length > 6 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? "Show Less" : `+${sourceTypes.length - 6} More`}
          </Button>
        )}
      </div>
    </div>
  )
}
