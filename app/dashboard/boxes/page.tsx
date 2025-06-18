"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreHorizontal, QrCode, ExternalLink, Pencil, Trash2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { formatDistanceToNow } from "date-fns"

interface WhatIfBox {
  id: string
  title: string
  question: string
  slug: string
  is_active: boolean
  created_at: string
}

export default function BoxesPage() {
  const [boxes, setBoxes] = useState<WhatIfBox[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("what_if_boxes")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        setBoxes(data || [])
      } catch (error) {
        console.error("Error fetching boxes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBoxes()
  }, [])

  const handleDeleteBox = async (id: string) => {
    if (!confirm("Are you sure you want to delete this What If Box?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("what_if_boxes").delete().eq("id", id)

      if (error) throw error

      // Update the local state
      setBoxes(boxes.filter((box) => box.id !== id))
    } catch (error) {
      console.error("Error deleting box:", error)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("what_if_boxes").update({ is_active: !currentStatus }).eq("id", id)

      if (error) throw error

      // Update the local state
      setBoxes(boxes.map((box) => (box.id === id ? { ...box, is_active: !currentStatus } : box)))
    } catch (error) {
      console.error("Error updating box status:", error)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">What If Boxes</h2>
        <Link href="/dashboard/create-box">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Box
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-5 w-32 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-48 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-16 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-24 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-8 w-8 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : boxes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No What If Boxes found. Create your first one!
                </TableCell>
              </TableRow>
            ) : (
              boxes.map((box) => (
                <TableRow key={box.id}>
                  <TableCell className="font-medium">{box.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{box.question}</TableCell>
                  <TableCell>
                    <Badge variant={box.is_active ? "default" : "secondary"}>
                      {box.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(box.created_at), { addSuffix: true })}
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
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/boxes/${box.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/boxes/${box.id}/qr`}>
                            <QrCode className="mr-2 h-4 w-4" />
                            QR Code
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/box/${box.slug}`} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(box.id, box.is_active)}>
                          <Badge variant={box.is_active ? "outline" : "default"} className="mr-2">
                            {box.is_active ? "Deactivate" : "Activate"}
                          </Badge>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteBox(box.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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
    </div>
  )
}
