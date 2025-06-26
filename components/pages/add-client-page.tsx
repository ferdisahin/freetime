"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ClientForm } from "@/components/client-form"
import type { ClientFormData, User } from "@/lib/types"
import { createClientAction } from "@/actions/client-actions"

interface AddClientPageProps {
  user: User
}

export function AddClientPage({ user }: AddClientPageProps) {
  const router = useRouter()

  const handleAddClient = async (clientData: ClientFormData) => {
    const result = await createClientAction(clientData)
    if (result.success) {
      router.push("/clients")
    } else {
      alert(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onSettingsClick={() => router.push("/settings")} />
      <div className="container mx-auto py-8 px-4">
        <ClientForm onSubmit={handleAddClient} onCancel={() => router.push("/clients")} />
      </div>
    </div>
  )
}
