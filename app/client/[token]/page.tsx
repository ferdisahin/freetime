import { notFound } from "next/navigation"
import { getClientByShareToken, getProjectsByClientId } from "@/lib/database-operations"
import { ClientDashboard } from "@/components/client-dashboard"

interface ClientPageProps {
  params: {
    token: string
  }
}

export default function ClientPage({ params }: ClientPageProps) {
  const client = getClientByShareToken(params.token)

  if (!client) {
    notFound()
  }

  const projects = getProjectsByClientId(client.id)

  return <ClientDashboard client={client} projects={projects} />
}
