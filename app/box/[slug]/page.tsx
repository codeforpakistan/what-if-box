"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lightbulb, Send } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase-client"

interface BoxPageProps {
  params: {
    slug: string
  }
}

export default function BoxPage({ params }: BoxPageProps) {
  const [box, setBox] = useState<any>(null)
  const [responses, setResponses] = useState<any[]>([])
  const [formData, setFormData] = useState({
    response: "",
    name: "",
    email: "",
    isAnonymous: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchBox = async () => {
      try {
        const supabase = getSupabaseClient()

        // Get box data
        const { data: boxData, error: boxError } = await supabase
          .from("what_if_boxes")
          .select("*")
          .eq("slug", params.slug)
          .eq("is_active", true)
          .single()

        if (boxError) throw boxError
        setBox(boxData)

        // Get approved responses
        const { data: responseData, error: responseError } = await supabase
          .from("responses")
          .select("*")
          .eq("box_id", boxData.id)
          .eq("is_approved", true)
          .order("created_at", { ascending: false })

        if (responseError) throw responseError
        setResponses(responseData || [])
      } catch (error: any) {
        setError(error.message || "Failed to load What If Box")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBox()
  }, [params.slug])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isAnonymous: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      if (!formData.response.trim()) {
        throw new Error("Please enter a response")
      }

      const supabase = getSupabaseClient()

      // Submit response
      const { error: submitError } = await supabase.from("responses").insert({
        box_id: box.id,
        response: formData.response,
        respondent_name: formData.isAnonymous ? null : formData.name,
        respondent_email: formData.isAnonymous ? null : formData.email,
        is_anonymous: formData.isAnonymous,
        is_approved: false, // Responses need approval before being displayed
      })

      if (submitError) throw submitError

      setSuccess("Thank you for your response! It will be visible after review.")
      setFormData({
        response: "",
        name: formData.name,
        email: formData.email,
        isAnonymous: formData.isAnonymous,
      })
    } catch (error: any) {
      setError(error.message || "Failed to submit response")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!box) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Not Found</CardTitle>
            <CardDescription>The What If Box you're looking for doesn't exist or is no longer active.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <a href="/">Return Home</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        backgroundColor: box.background_color,
        color: box.text_color,
      }}
    >
      <header className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6" />
          <span className="text-xl font-bold">Virtual What If Box</span>
        </div>
      </header>

      <main className="container mx-auto flex flex-1 flex-col items-center justify-center p-4">
        <div className="w-full max-w-3xl space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">{box.question}</h1>
            {box.description && <p className="mx-auto max-w-2xl text-lg">{box.description}</p>}
          </div>

          <Card className="border-none shadow-lg" style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Share Your Thoughts</CardTitle>
                <CardDescription>Your response will be visible after review</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="border-green-500 text-green-500">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="response">Your Response</Label>
                  <Textarea
                    id="response"
                    name="response"
                    placeholder="Share your ideas..."
                    value={formData.response}
                    onChange={handleChange}
                    rows={4}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="isAnonymous" checked={formData.isAnonymous} onCheckedChange={handleCheckboxChange} />
                  <Label htmlFor="isAnonymous">Submit anonymously</Label>
                </div>
                {!formData.isAnonymous && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name (Optional)</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email (Optional)</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Your email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Submitting..." : "Submit Response"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {responses.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center">Community Responses</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {responses.map((response) => (
                  <Card
                    key={response.id}
                    className="border-none shadow-md"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.8)" }}
                  >
                    <CardContent className="p-4">
                      <p className="italic">"{response.response}"</p>
                      <p className="mt-2 text-sm text-right">
                        {response.is_anonymous || !response.respondent_name
                          ? "- Anonymous"
                          : `- ${response.respondent_name}`}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="container mx-auto p-4 text-center text-sm">
        <p>© {new Date().getFullYear()} Virtual What If Box. All rights reserved.</p>
      </footer>
    </div>
  )
}
