"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ClientForm } from "@/components/client-form"
import type { Client, ClientFormData, User } from "@/lib/types"
import { updateClientAction } from "@/actions/client-actions"

interface EditClientPageProps {
  user: User
  client: Client
}

export function EditClientPage({ user, client }: EditClientPageProps) {
  const router = useRouter()

  const handleUpdateClient = async (clientData: ClientFormData) => {
    const result = await updateClientAction(client.id, clientData)
    if (result.success) {
      router.push("/clients")
    } else {
      alert(result.error)
    }
  }

  const initialData: ClientFormData = {
    name: client.name,
    type: client.type,
    email: client.email,
    phone: client.phone,
    company: client.company,
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onSettingsClick={() => router.push("/settings")} />
      <div className="container mx-auto py-8 px-4">
        <ClientForm
          onSubmit={handleUpdateClient}
          onCancel={() => router.push("/clients")}
          initialData={initialData}
          isEditing={true}
        />
      </div>
    </div>
  )
}
