import { redirect } from "next/navigation"
import { SetupForm } from "@/components/setup-form"
import { isSetupComplete } from "@/lib/db"

export default function SetupPage() {
  if (isSetupComplete()) {
    redirect("/login")
  }

  return <SetupForm />
}
