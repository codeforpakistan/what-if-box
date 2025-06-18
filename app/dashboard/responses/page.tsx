"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Check, X } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase-client"
import { formatDistanceToNow } from "date-fns"

interface Response {
  id: string
  box_id: string
  response: string
  respondent_name: string | null
  respondent_email: string | null
  is_anonymous: boolean
  is_approved: boolean
  created_at: string
  box: {
    title: string
    slug: string
  }
}

export default function ResponsesPage() {
  const [responses, setResponses] = useState<Response[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const supabase = getSupabaseClient()
        
        // Get current user first
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.error("User error:", userError)
          return
        }

        // First, get the user's boxes
        const { data: userBoxes, error: boxesError } = await supabase
          .from("what_if_boxes")
          .select("id, title, slug")
          .eq("created_by", user.id)

        if (boxesError) throw boxesError
        
        if (!userBoxes || userBoxes.length === 0) {
          setResponses([])
          return
        }

        const boxIds = userBoxes.map(box => box.id)
        
        // Now get responses only for the user's boxes
        const { data, error } = await supabase
          .from("responses")
          .select("*")
          .in("box_id", boxIds)
          .order("created_at", { ascending: false })

        if (error) throw error
        
        // Transform the data to match the expected structure
        const transformedData = (data || []).map((response: any) => ({
          ...response,
          box: {
            title: userBoxes.find(b => b.id === response.box_id)?.title || 'Unknown Box',
            slug: userBoxes.find(b => b.id === response.box_id)?.slug || ''
          }
        })) as Response[]
        
        setResponses(transformedData)
      } catch (error) {
        console.error("Error fetching responses:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResponses()
  }, [])

  const handleApproveResponse = async (id: string) => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from("responses").update({ is_approved: true }).eq("id", id)

      if (error) throw error

      // Update the local state
      setResponses(responses.map((response) => (response.id === id ? { ...response, is_approved: true } : response)))
    } catch (error) {
      console.error("Error approving response:", error)
    }
  }

  const handleRejectResponse = async (id: string) => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from("responses").delete().eq("id", id)

      if (error) throw error

      // Update the local state
      setResponses(responses.filter((response) => response.id !== id))
    } catch (error) {
      console.error("Error rejecting response:", error)
    }
  }

  const pendingResponses = responses.filter((response) => !response.is_approved)
  const approvedResponses = responses.filter((response) => response.is_approved)

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Responses</h2>
      </div>

      {pendingResponses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Approval ({pendingResponses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Response</TableHead>
                    <TableHead>Box</TableHead>
                    <TableHead>Respondent</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="h-5 w-48 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-5 w-32 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-5 w-24 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-5 w-24 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-8 w-8 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : pendingResponses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No pending responses
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingResponses.map((response) => (
                      <TableRow key={response.id}>
                        <TableCell className="max-w-xs truncate font-medium">{response.response}</TableCell>
                        <TableCell>{response.box?.title}</TableCell>
                        <TableCell>
                          {response.is_anonymous || !response.respondent_name ? "Anonymous" : response.respondent_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleApproveResponse(response.id)}>
                                <Check className="mr-2 h-4 w-4 text-green-500" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRejectResponse(response.id)}>
                                <X className="mr-2 h-4 w-4 text-red-500" />
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Approved Responses ({approvedResponses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Response</TableHead>
                  <TableHead>Box</TableHead>
                  <TableHead>Respondent</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="h-5 w-48 animate-pulse rounded bg-muted"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-32 animate-pulse rounded bg-muted"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-24 animate-pulse rounded bg-muted"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-24 animate-pulse rounded bg-muted"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-8 w-8 animate-pulse rounded bg-muted"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : approvedResponses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No approved responses yet
                    </TableCell>
                  </TableRow>
                ) : (
                  approvedResponses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell className="max-w-xs truncate font-medium">{response.response}</TableCell>
                      <TableCell>{response.box?.title}</TableCell>
                      <TableCell>
                        {response.is_anonymous || !response.respondent_name ? "Anonymous" : response.respondent_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRejectResponse(response.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
