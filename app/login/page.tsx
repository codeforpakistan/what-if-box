"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lightbulb, ArrowLeft } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import LoginForm from "./login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <a href="/" className="absolute left-8 top-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Back to home</span>
      </a>
      
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-2">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Virtual What If Box
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to create and manage your What If Boxes</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Continue inspiring your community with thought-provoking questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center space-y-2">
            <div className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
                Create one now
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
