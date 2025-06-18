"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { Box, MessageSquare, Users, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    myBoxes: 0,
    myActiveBoxes: 0,
    myTotalResponses: 0,
    myRecentResponses: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUserAndStats = async () => {
      try {
        const supabase = createClient()

        // Get current user
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !currentUser) {
          console.error("User error:", userError)
          return
        }

        setUser(currentUser)

        // Get user's boxes
        const { count: myBoxes } = await supabase
          .from("what_if_boxes")
          .select("*", { count: "exact", head: true })
          .eq("created_by", currentUser.id)

        // Get user's active boxes
        const { count: myActiveBoxes } = await supabase
          .from("what_if_boxes")
          .select("*", { count: "exact", head: true })
          .eq("created_by", currentUser.id)
          .eq("is_active", true)

        // Get total responses to user's boxes
        const { count: myTotalResponses } = await supabase
          .from("responses")
          .select("*, what_if_boxes!inner(*)", { count: "exact", head: true })
          .eq("what_if_boxes.created_by", currentUser.id)

        // Get recent responses (last 7 days) to user's boxes
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        
        const { count: myRecentResponses } = await supabase
          .from("responses")
          .select("*, what_if_boxes!inner(*)", { count: "exact", head: true })
          .eq("what_if_boxes.created_by", currentUser.id)
          .gte("created_at", sevenDaysAgo.toISOString())

        setStats({
          myBoxes: myBoxes || 0,
          myActiveBoxes: myActiveBoxes || 0,
          myTotalResponses: myTotalResponses || 0,
          myRecentResponses: myRecentResponses || 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAndStats()
  }, [])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back{user?.user_metadata?.name ? `, ${user.user_metadata.name}` : ''}!</h2>
          <p className="text-muted-foreground">
            Here's what's happening with your What If Boxes
          </p>
        </div>
        <Link href="/dashboard/create-box">
          <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
            <Plus className="mr-2 h-4 w-4" />
            Create New Box
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My What If Boxes</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <div className="h-8 w-16 animate-pulse rounded bg-muted"></div> : stats.myBoxes}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.myActiveBoxes} currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <div className="h-8 w-16 animate-pulse rounded bg-muted"></div> : stats.myTotalResponses}
            </div>
            <p className="text-xs text-muted-foreground">Across all your boxes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <div className="h-8 w-16 animate-pulse rounded bg-muted"></div> : stats.myRecentResponses}
            </div>
            <p className="text-xs text-muted-foreground">New responses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-16 animate-pulse rounded bg-muted"></div>
              ) : stats.myBoxes > 0 ? (
                Math.round(stats.myTotalResponses / stats.myBoxes)
              ) : (
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Responses per box</p>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Section for New Users */}
      {!isLoading && stats.myBoxes === 0 && (
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>🎉 Welcome to Virtual What If Box!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Ready to start asking the questions that matter? Here's how to get started:
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">1</span>
                  Create Your First Box
                </h4>
                <p className="text-sm text-muted-foreground">
                  Think of a thought-provoking question that could inspire your community.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-600">2</span>
                  Share the QR Code
                </h4>
                <p className="text-sm text-muted-foreground">
                  Place your QR code in public spaces where people can discover and scan it.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600">3</span>
                  Watch Ideas Flow
                </h4>
                <p className="text-sm text-muted-foreground">
                  Review and moderate responses as your community shares their imagination.
                </p>
              </div>
            </div>
            <div className="pt-4">
              <Link href="/dashboard/create-box">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First What If Box
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
