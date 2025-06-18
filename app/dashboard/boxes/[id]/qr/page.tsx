"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getSupabaseClient } from "@/lib/supabase-client"
import { QRCodeSVG } from "qrcode.react"
import { Download, Copy, Share2 } from "lucide-react"

interface QRCodePageProps {
  params: {
    id: string
  }
}

// Helper function to validate UUID
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export default function QRCodePage({ params }: QRCodePageProps) {
  const [box, setBox] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchBox = async () => {
      try {
        // Validate UUID format before querying
        if (!params.id || !isValidUUID(params.id)) {
          throw new Error("Invalid box ID format")
        }

        const supabase = getSupabaseClient()
        const { data, error } = await supabase.from("what_if_boxes").select("*").eq("id", params.id).single()

        if (error) throw error
        setBox(data)
      } catch (error: any) {
        setError(error.message || "Failed to load What If Box")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBox()
  }, [params.id])

  const boxUrl = box ? `${window.location.origin}/box/${box.slug}` : ""

  const handleCopyLink = () => {
    navigator.clipboard.writeText(boxUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: box.title,
          text: box.question,
          url: boxUrl,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      handleCopyLink()
    }
  }

  const handleDownload = () => {
    if (!qrRef.current) return

    const svg = qrRef.current.querySelector("svg")
    if (!svg) return

    // Create a canvas element
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions (with some padding)
    const size = 1024
    canvas.width = size
    canvas.height = size

    // Fill with white background
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, size, size)

    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`

    img.onload = () => {
      // Draw the image centered with padding
      const padding = 50
      ctx.drawImage(img, padding, padding, size - 2 * padding, size - 2 * padding)

      // Add title and URL at the bottom
      ctx.font = "bold 24px Arial"
      ctx.fillStyle = "black"
      ctx.textAlign = "center"
      ctx.fillText(box.title, size / 2, size - 60)

      ctx.font = "16px Arial"
      ctx.fillText(boxUrl, size / 2, size - 30)

      // Create download link
      const link = document.createElement("a")
      link.download = `what-if-box-${box.slug}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
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
          <CardContent className="flex justify-center">
            <div className="h-64 w-64 animate-pulse rounded bg-muted"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !box) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Error</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Could not load QR Code</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error || "Box not found"}</AlertDescription>
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
        <h2 className="text-3xl font-bold tracking-tight">QR Code</h2>
        <Button variant="outline" onClick={() => router.push("/dashboard/boxes")}>
          Back to Boxes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{box?.title}</CardTitle>
          <CardDescription>
            QR code for your What If Box. Print this code and place it in public spaces.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div ref={qrRef} className="bg-white p-4 rounded-lg shadow-sm">
            <QRCodeSVG value={boxUrl} size={250} level="H" includeMargin />
          </div>
          <div className="text-center">
            <p className="font-medium">{box?.question}</p>
            <p className="text-sm text-muted-foreground mt-2">{boxUrl}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" onClick={handleCopyLink}>
            <Copy className="mr-2 h-4 w-4" />
            {copied ? "Copied!" : "Copy Link"}
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
