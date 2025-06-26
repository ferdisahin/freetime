import { notFound } from "next/navigation"
import { getProjectByShareToken, getAllClients } from "@/lib/database-operations"
import { ProjectShare } from "@/components/project-share"

interface SharePageProps {
  params: {
    token: string
  }
}

export default function SharePage({ params }: SharePageProps) {
  const project = getProjectByShareToken(params.token)

  if (!project) {
    notFound()
  }

  const clients = getAllClients()
  const client = clients.find((c) => c.id === project.clientId)

  if (!client) {
    notFound()
  }

  return <ProjectShare project={project} client={client} />
}
