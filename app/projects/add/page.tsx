import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { isSetupComplete, initializeDatabase } from "@/lib/db"
import { AddProjectPage } from "@/components/pages/add-project-page"

export default async function AddProject() {
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

  return <AddProjectPage user={user} />
}
