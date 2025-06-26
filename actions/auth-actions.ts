"use server"

import { redirect } from "next/navigation"
import { createAdminUser, authenticateUser, isSetupComplete } from "@/lib/db"
import { createSession, deleteSession } from "@/lib/auth"
import type { SetupFormData, LoginFormData } from "@/lib/types"

export async function checkSetupStatus() {
  return { isComplete: isSetupComplete() }
}

export async function setupAdmin(formData: FormData) {
  const data: SetupFormData = {
    username: formData.get("username") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    fullName: formData.get("fullName") as string,
  }

  // Validation
  if (!data.username || !data.email || !data.password || !data.fullName) {
    return { success: false, error: "Tüm alanları doldurun" }
  }

  if (data.password !== data.confirmPassword) {
    return { success: false, error: "Şifreler eşleşmiyor" }
  }

  if (data.password.length < 6) {
    return { success: false, error: "Şifre en az 6 karakter olmalı" }
  }

  // Check if setup is already complete
  if (isSetupComplete()) {
    return { success: false, error: "Kurulum zaten tamamlanmış" }
  }

  try {
    await createAdminUser(data)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Kullanıcı oluşturulamadı" }
  }
}

export async function loginUser(formData: FormData) {
  const data: LoginFormData = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  }

  if (!data.username || !data.password) {
    return { success: false, error: "Kullanıcı adı ve şifre gerekli" }
  }

  try {
    const user = await authenticateUser(data.username, data.password)
    if (!user) {
      return { success: false, error: "Geçersiz kullanıcı adı veya şifre" }
    }

    await createSession(user)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Giriş yapılamadı" }
  }
}

export async function logoutUser() {
  await deleteSession()
  redirect("/login")
}
