"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase-client"
import { Box, MessageSquare, Users } from "lucide-react"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalBoxes: 0,
    activeBoxes: 0,
    totalResponses: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = getSupabaseClient()

        // Get total boxes
        const { count: totalBoxes } = await supabase.from("what_if_boxes").select("*", { count: "exact", head: true })

        // Get active boxes
        const { count: activeBoxes } = await supabase
          .from("what_if_boxes")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true)

        // Get total responses
        const { count: totalResponses } = await supabase.from("responses").select("*", { count: "exact", head: true })

        setStats({
          totalBoxes: totalBoxes || 0,
          activeBoxes: activeBoxes || 0,
          totalResponses: totalResponses || 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total What If Boxes</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <div className="h-8 w-16 animate-pulse rounded bg-muted"></div> : stats.totalBoxes}
            </div>
            <p className="text-xs text-muted-foreground">{stats.activeBoxes} active boxes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <div className="h-8 w-16 animate-pulse rounded bg-muted"></div> : stats.totalResponses}
            </div>
            <p className="text-xs text-muted-foreground">From all What If Boxes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Responses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-16 animate-pulse rounded bg-muted"></div>
              ) : stats.totalBoxes ? (
                Math.round(stats.totalResponses / stats.totalBoxes)
              ) : (
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Per What If Box</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
