"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Lightbulb, Globe, Users, QrCode, MessageCircle, Sparkles, Heart } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase-client"

export default function Home() {
  const [stats, setStats] = useState({
    totalBoxes: 0,
    totalResponses: 0,
    activeBoxes: 0,
    isLoading: true
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = getSupabaseClient()

        // Get total boxes
        const { count: totalBoxes } = await supabase
          .from("what_if_boxes")
          .select("*", { count: "exact", head: true })

        // Get active boxes
        const { count: activeBoxes } = await supabase
          .from("what_if_boxes")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true)

        // Get total responses
        const { count: totalResponses } = await supabase
          .from("responses")
          .select("*", { count: "exact", head: true })

        setStats({
          totalBoxes: totalBoxes || 0,
          activeBoxes: activeBoxes || 0,
          totalResponses: totalResponses || 0,
          isLoading: false
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
        setStats(prev => ({ ...prev, isLoading: false }))
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 py-4 max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-2">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Virtual What If Box
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                Join Community
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
          <div className="container relative mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-8 text-center">
              <div className="space-y-4 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
                  <Sparkles className="h-4 w-4" />
                  Community Ideas, Global Impact
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  What If We Could
                  <br />
                  <span className="relative">
                    Change Everything?
                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
                  </span>
                </h1>
                <p className="mx-auto max-w-3xl text-lg md:text-xl text-gray-600 leading-relaxed">
                  Scan. Think. Share. Transform. Virtual What If Box connects communities worldwide through 
                  thought-provoking questions that spark real change. Every QR code is a doorway to collective imagination.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link href="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-6 text-lg">
                    Start Creating
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Globe className="h-4 w-4" />
                  <span>Growing globally, one question at a time</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                From Street Corners to Global Conversations
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Anyone, anywhere can spark community dialogue with a simple QR code
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-8 hover:shadow-xl transition-all duration-300">
                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
                  <QrCode className="h-16 w-16 text-blue-500" />
                </div>
                <div className="relative">
                  <div className="inline-flex items-center justify-center rounded-full bg-blue-500 p-3 text-white mb-4">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">Discover & Scan</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Spot a QR code on a lamppost, park bench, or coffee shop wall. Each code holds a unique question waiting to unlock your community's imagination.
                  </p>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-8 hover:shadow-xl transition-all duration-300">
                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
                  <MessageCircle className="h-16 w-16 text-purple-500" />
                </div>
                <div className="relative">
                  <div className="inline-flex items-center justify-center rounded-full bg-purple-500 p-3 text-white mb-4">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">Think & Respond</h3>
                  <p className="text-gray-600 leading-relaxed">
                    "What if your city had no cars?" "How would you redesign your workplace?" Share your vision anonymously or with your name - every voice matters.
                  </p>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 p-8 hover:shadow-xl transition-all duration-300 md:col-span-2 lg:col-span-1">
                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
                  <Heart className="h-16 w-16 text-pink-500" />
                </div>
                <div className="relative">
                  <div className="inline-flex items-center justify-center rounded-full bg-pink-500 p-3 text-white mb-4">
                    <Heart className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">Connect & Inspire</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Your ideas join a growing collection of community dreams. Together, we're building a map of human imagination and potential.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Section - Real Data */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Building Community Imagination
              </h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Every question matters, every response counts
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-center max-w-4xl mx-auto">
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold">
                  {stats.isLoading ? "..." : stats.totalBoxes}
                </div>
                <div className="text-blue-100">
                  {stats.totalBoxes === 1 ? "What if Box" : "What if Boxes"}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold">
                  {stats.isLoading ? "..." : stats.totalResponses}
                </div>
                <div className="text-blue-100">
                  Community {stats.totalResponses === 1 ? "Response" : "Responses"}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold">
                  {stats.isLoading ? "..." : stats.activeBoxes}
                </div>
                <div className="text-blue-100">
                  Active {stats.activeBoxes === 1 ? "Question" : "Questions"}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold">∞</div>
                <div className="text-blue-100">Possibilities Ahead</div>
              </div>
            </div>

            {stats.totalBoxes === 0 && !stats.isLoading && (
              <div className="text-center mt-8">
                <p className="text-blue-100 text-lg">
                  🚀 Ready to launch? Create your first what if box and start the conversation!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Community Examples */}
        <section className="w-full py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Questions That Could Change Communities
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Imagine the conversations these questions could spark in your neighborhood
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              <div className="rounded-xl bg-white p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <div className="text-sm font-medium text-purple-600 mb-2">Your City</div>
                  <h3 className="font-semibold text-lg text-gray-900">"What if every roof was a garden?"</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  A simple question that could transform urban landscapes and create community-driven food security initiatives.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MessageCircle className="h-4 w-4" />
                  <span>Potential for impact</span>
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <div className="text-sm font-medium text-blue-600 mb-2">Your Neighborhood</div>
                  <h3 className="font-semibold text-lg text-gray-900">"How would you make your street safer for children?"</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Community-driven safety solutions often start with asking the right questions to the right people.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Heart className="h-4 w-4" />
                  <span>Community focused</span>
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm border hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
                <div className="mb-4">
                  <div className="text-sm font-medium text-green-600 mb-2">Your Workplace</div>
                  <h3 className="font-semibold text-lg text-gray-900">"What if work felt like play?"</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Sometimes the most profound changes start with reimagining our daily experiences completely.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Sparkles className="h-4 w-4" />
                  <span>Future thinking</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Ask the Questions That Matter?
              </h2>
              <p className="text-xl text-gray-300">
                Every great change started with a simple question. What's yours?
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg">
                    Start Creating
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <div className="text-sm text-gray-400">
                  Join the community of questioners
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row px-4 max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1">
              <Lightbulb className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-600">Virtual What If Box</span>
          </div>
          <p className="text-sm text-gray-500 text-center md:text-right">
            © {new Date().getFullYear()} Community-driven imagination, worldwide impact.
          </p>
        </div>
      </footer>
    </div>
  )
}

