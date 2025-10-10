"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Moon, Sun, Sparkles, LogIn, LogOut, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"
import { toast } from "sonner"

interface User {
  id: string
  email: string
  name: string
}

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })
      const data = await response.json()
      if (data.success) {
        setUser(null)
        toast.success('Logged out successfully')
        router.push('/login')
        router.refresh()
      }
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  const navItems = [
    { href: "/", label: "Digest" },
    { href: "/history", label: "History" },
    { href: "/settings", label: "Settings" },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-accent to-primary opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-50" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-accent to-primary shadow-lg">
              <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-xl font-bold tracking-tight text-transparent">
              CreatorPulse
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">AI Intelligence Hub</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                size="sm"
                className="text-sm font-medium"
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9" aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Auth Actions */}
          {!loading && (
            <>
              {user ? (
                /* User Avatar */
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                          {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <UserIcon className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/history">History</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                /* Login Button */
                <Button
                  variant="default"
                  size="sm"
                  asChild
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="flex items-center justify-center gap-1 border-t border-border/40 px-4 py-2 md:hidden">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="flex-1">
            <Button variant={pathname === item.href ? "secondary" : "ghost"} size="sm" className="w-full text-xs">
              {item.label}
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  )
}
