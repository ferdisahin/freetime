"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ClientTable } from "@/components/client-table"
import type { Client, User } from "@/lib/types"
import { getClientsAction, deleteClientAction } from "@/actions/client-actions"

interface ClientsPageProps {
  user: User
}

export function ClientsPage({ user }: ClientsPageProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadClients = async () => {
      const result = await getClientsAction()
      if (result.success) {
        setClients(result.data)
      }
      setIsLoading(false)
    }

    loadClients()
  }, [])

  const handleDeleteClient = async (id: number) => {
    if (confirm("Bu müşteriyi silmek istediğinizden emin misiniz?")) {
      const result = await deleteClientAction(id)
      if (result.success) {
        setClients((prev) => prev.filter((c) => c.id !== id))
      } else {
        alert(result.error)
      }
    }
  }

  const handleEditClient = (client: Client) => {
    router.push(`/clients/edit/${client.id}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Veriler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onSettingsClick={() => router.push("/settings")} />
      <div className="container mx-auto py-8 px-4">
        <ClientTable
          clients={clients}
          onDelete={handleDeleteClient}
          onEdit={handleEditClient}
          onAddNew={() => router.push("/clients/add")}
          onBack={() => router.push("/projects")}
        />
      </div>
    </div>
  )
}
