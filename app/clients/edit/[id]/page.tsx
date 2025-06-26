import { redirect, notFound } from "next/navigation"
import { getSession } from "@/lib/auth"
import { isSetupComplete, initializeDatabase } from "@/lib/db"
import { getAllClients } from "@/lib/database-operations"
import { EditClientPage } from "@/components/pages/edit-client-page"

interface EditClientProps {
  params: {
    id: string
  }
}

export default async function EditClient({ params }: EditClientProps) {
  // Initialize database
  initializeDatabase()

  // Check if setup is complete
  if (!isSetupComplete()) {
    redirect("/setup")
  }

  // Check if user is logged in
  const user = await getSession()
  if (!user) {
    redirect("/login")
  }

  // Get client
  const clients = getAllClients()
  const client = clients.find((c) => c.id === Number.parseInt(params.id))

  if (!client) {
    notFound()
  }

  return <EditClientPage user={user} client={client} />
}
