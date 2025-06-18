"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase-client"

export default function TestAuthPage() {
  const [authState, setAuthState] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = getSupabaseClient()
        
        // Get session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        console.log("Session data:", sessionData, "Session error:", sessionError)
        
        // Get user
        const { data: userData, error: userError } = await supabase.auth.getUser()
        console.log("User data:", userData, "User error:", userError)
        
        setAuthState({
          session: sessionData.session,
          user: userData.user,
          sessionError,
          userError,
          cookies: typeof document !== 'undefined' ? document.cookie : 'N/A'
        })
      } catch (error) {
        console.error("Auth check error:", error)
        setAuthState({ error: error instanceof Error ? error.message : String(error) })
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return <div className="p-8">Loading auth state...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Session Status:</h2>
          <p>{authState?.session ? "✅ Session exists" : "❌ No session"}</p>
          {authState?.sessionError && <p className="text-red-500">Session Error: {authState.sessionError.message}</p>}
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">User Status:</h2>
          <p>{authState?.user ? `✅ User: ${authState.user.email}` : "❌ No user"}</p>
          {authState?.userError && <p className="text-red-500">User Error: {authState.userError.message}</p>}
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Browser Cookies:</h2>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {authState?.cookies || 'No cookies'}
          </pre>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Full Auth State:</h2>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(authState, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="mt-8">
        <a href="/login" className="text-blue-500 underline mr-4">Go to Login</a>
        <a href="/dashboard" className="text-blue-500 underline">Try Dashboard</a>
      </div>
    </div>
  )
} 