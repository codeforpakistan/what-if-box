"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lightbulb } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase-client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          // Already logged in, redirect to dashboard
          router.push("/dashboard")
        }
        
        // Check for error messages in URL params
        const urlParams = new URLSearchParams(window.location.search)
        const errorParam = urlParams.get('error')
        if (errorParam === 'unauthorized') {
          setError("You don't have admin access to this application.")
        }
      } catch (error) {
        console.error("Session check error:", error)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkSession()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      console.log("Login successful, session created:", !!data.session)
      console.log("Access token exists:", !!data.session?.access_token)
      
      // Check if session was properly set
      const { data: sessionCheck } = await supabase.auth.getSession()
      console.log("Session check after login:", !!sessionCheck.session)
      
      // Debug: Check what cookies are in the browser
      if (typeof document !== 'undefined') {
        console.log("Browser cookies after login:", document.cookie)
      }
      
      // On successful login, force refresh browser to reload middleware
      window.location.href = '/dashboard'
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Failed to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Link href="/" className="absolute left-8 top-8 flex items-center gap-2">
        <Lightbulb className="h-6 w-6" />
        <span className="text-xl font-bold">Virtual What If Box</span>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Sign in to access your What If Box dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center space-y-2">
          <div className="text-sm text-muted-foreground">Don&apos;t have an account? Contact your administrator.</div>
        </CardFooter>
      </Card>
    </div>
  )
}
