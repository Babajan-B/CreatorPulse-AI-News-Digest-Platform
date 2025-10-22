"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Rss, Mic, FileText } from 'lucide-react'

export default function TestPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Test Page - Switch Mode Button</h1>
      
      <div className="flex flex-wrap gap-2 mb-8">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push('/select-mode')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Switch Mode
        </Button>
        
        <Button
          onClick={() => router.push('/sources')}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Rss className="h-4 w-4" />
          Add Custom Sources
        </Button>
        
        <Button
          onClick={() => router.push('/voice-training')}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Mic className="h-4 w-4" />
          Train Voice
        </Button>
        
        <Button
          onClick={() => router.push('/drafts')}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Generate Newsletter
        </Button>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">✅ Switch Mode Button Test</h2>
        <p className="text-gray-700">
          If you can see the "Switch Mode" button above, then the button is working correctly!
          The issue with the main page is that it's showing the intro page instead of the main content.
        </p>
        <p className="text-gray-600 mt-2">
          To fix the main page, you need to either:
        </p>
        <ul className="list-disc list-inside text-gray-600 mt-2">
          <li>Click "Click anywhere to continue" on the intro page</li>
          <li>Or clear your browser's localStorage</li>
          <li>Or use the debug button I added to the main page</li>
        </ul>
      </div>

      <div className="mt-8">
        <Button onClick={() => router.push('/')} variant="default">
          Go Back to Main Page
        </Button>
      </div>
    </div>
  )
}

