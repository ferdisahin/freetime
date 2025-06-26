"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { SettingsForm } from "@/components/settings-form"
import type { User } from "@/lib/types"

interface SettingsPageProps {
  user: User
}

export function SettingsPage({ user }: SettingsPageProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onSettingsClick={() => router.push("/settings")} />
      <div className="container mx-auto py-8 px-4">
        <SettingsForm onBack={() => router.push("/projects")} />
      </div>
    </div>
  )
}
