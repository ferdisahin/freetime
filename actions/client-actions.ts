"use server"

import { revalidatePath } from "next/cache"
import { getAllClients, createClient, updateClient, deleteClient } from "@/lib/database-operations"
import type { ClientFormData } from "@/lib/types"

export async function getClientsAction() {
  try {
    return { success: true, data: getAllClients() }
  } catch (error) {
    return { success: false, error: "Müşteriler getirilemedi" }
  }
}

export async function createClientAction(data: ClientFormData) {
  try {
    const client = createClient(data)
    revalidatePath("/")
    return { success: true, data: client }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Müşteri oluşturulamadı" }
  }
}

export async function updateClientAction(id: number, data: Partial<ClientFormData>) {
  try {
    updateClient(id, data)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Müşteri güncellenemedi" }
  }
}

export async function deleteClientAction(id: number) {
  try {
    deleteClient(id)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Müşteri silinemedi" }
  }
}
