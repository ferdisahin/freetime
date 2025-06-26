import { redirect, notFound } from "next/navigation"
import { getSession } from "@/lib/auth"
import { isSetupComplete, initializeDatabase } from "@/lib/db"
import { getAllProjects } from "@/lib/database-operations"
import { EditProjectPage } from "@/components/pages/edit-project-page"

interface EditProjectProps {
  params: {
    id: string
  }
}

export default async function EditProject({ params }: EditProjectProps) {
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

  // Get project
  const projects = getAllProjects()
  const project = projects.find((p) => p.id === Number.parseInt(params.id))

  if (!project) {
    notFound()
  }

  return <EditProjectPage user={user} project={project} />
}
