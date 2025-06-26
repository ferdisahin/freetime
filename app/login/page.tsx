import { redirect } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { isSetupComplete } from "@/lib/db"
import { getSession } from "@/lib/auth"

export default async function LoginPage() {
  if (!isSetupComplete()) {
    redirect("/setup")
  }

  const user = await getSession()
  if (user) {
    redirect("/")
  }

  return <LoginForm />
}
