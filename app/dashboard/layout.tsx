import type React from "react"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { createClient } from "@/utils/supabase/server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <div className="flex min-h-screen flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
