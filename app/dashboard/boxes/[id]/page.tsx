"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/utils/supabase/client"

interface BoxPageProps {
  params: {
    id: string
  }
}

// Helper function to validate UUID
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export default function EditBoxPage({ params }: BoxPageProps) {
  const [formData, setFormData] = useState({
    title: "",
    question: "",
    description: "",
    slug: "",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    isActive: true,
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchBox = async () => {
      try {
        // Validate UUID format before querying
        if (!params.id || !isValidUUID(params.id)) {
          throw new Error("Invalid box ID format")
        }

        const supabase = createClient()
        const { data, error } = await supabase.from("what_if_boxes").select("*").eq("id", params.id).single()

        if (error) throw error

        if (data) {
          setFormData({
            title: data.title,
            question: data.question,
            description: data.description || "",
            slug: data.slug,
            backgroundColor: data.background_color,
            textColor: data.text_color,
            isActive: data.is_active,
          })
        }
      } catch (error: any) {
        setError(error.message || "Failed to load What If Box")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBox()
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      // Validate UUID format before updating
      if (!params.id || !isValidUUID(params.id)) {
        throw new Error("Invalid box ID format")
      }

      const supabase = createClient()

      // Check if slug is unique (excluding this box)
      const { data: existingBox } = await supabase
        .from("what_if_boxes")
        .select("id")
        .eq("slug", formData.slug)
        .neq("id", params.id)
        .single()

      if (existingBox) {
        throw new Error("A What If Box with this slug already exists. Please choose a different slug.")
      }

      // Update box
      const { error: updateError } = await supabase
        .from("what_if_boxes")
        .update({
          title: formData.title,
          question: formData.question,
          description: formData.description,
          slug: formData.slug,
          background_color: formData.backgroundColor,
          text_color: formData.textColor,
          is_active: formData.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)

      if (updateError) throw updateError

      router.push("/dashboard/boxes")
    } catch (error: any) {
      setError(error.message || "Failed to update What If Box")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded bg-muted"></div>
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-32 animate-pulse rounded bg-muted"></div>
            <div className="h-4 w-64 animate-pulse rounded bg-muted"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                <div className="h-10 w-full animate-pulse rounded bg-muted"></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Error</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Could not load What If Box</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard/boxes")}>Back to Boxes</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Edit What If Box</h2>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Box Details</CardTitle>
            <CardDescription>Edit your What If Box details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input id="question" name="question" value={formData.question} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input id="slug" name="slug" value={formData.slug} onChange={handleChange} required />
              <p className="text-xs text-muted-foreground">This will be used in the URL: /box/{formData.slug}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="backgroundColor"
                    name="backgroundColor"
                    type="color"
                    value={formData.backgroundColor}
                    onChange={handleChange}
                    className="h-10 w-10 p-1"
                  />
                  <Input
                    type="text"
                    value={formData.backgroundColor}
                    onChange={handleChange}
                    name="backgroundColor"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="textColor"
                    name="textColor"
                    type="color"
                    value={formData.textColor}
                    onChange={handleChange}
                    className="h-10 w-10 p-1"
                  />
                  <Input
                    type="text"
                    value={formData.textColor}
                    onChange={handleChange}
                    name="textColor"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="isActive" checked={formData.isActive} onCheckedChange={handleSwitchChange} />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/boxes")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
