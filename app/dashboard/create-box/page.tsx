"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { getSupabaseClient } from "@/lib/supabase-client"

export default function NewBoxPage() {
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
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Auto-generate slug from title
    if (name === "title") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")

      setFormData((prev) => ({ ...prev, slug }))
    }
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to create a What If Box")
      }

      // Check if slug is unique
      const { data: existingBox } = await supabase.from("what_if_boxes").select("id").eq("slug", formData.slug).single()

      if (existingBox) {
        throw new Error(
          "A What If Box with this slug already exists. Please choose a different title or modify the slug.",
        )
      }

      // Insert new box
      const { error: insertError } = await supabase.from("what_if_boxes").insert({
        title: formData.title,
        question: formData.question,
        description: formData.description,
        slug: formData.slug,
        background_color: formData.backgroundColor,
        text_color: formData.textColor,
        is_active: formData.isActive,
        created_by: user.id,
      })

      if (insertError) throw insertError

      router.push("/dashboard/boxes")
    } catch (error: any) {
      setError(error.message || "Failed to create What If Box")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Create New What If Box</h2>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Box Details</CardTitle>
            <CardDescription>Create a new What If Box with a thought-provoking question</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., City Reimagined"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                name="question"
                placeholder="e.g., What if you could re-imagine your city?"
                value={formData.question}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Provide additional context or instructions for respondents"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                name="slug"
                placeholder="city-reimagined"
                value={formData.slug}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                This will be used in the URL: /box/{formData.slug || "your-slug"}
              </p>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Box"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
