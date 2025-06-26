import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { isSetupComplete, initializeDatabase } from "@/lib/db"
import { AddProjectPage } from "@/components/pages/add-project-page"

interface AddProjectProps {
  searchParams: {
    type?: string
  }
}

export default async function AddProject({ searchParams }: AddProjectProps) {
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

  return <AddProjectPage user={user} selectedType={searchParams.type as any} />
}
