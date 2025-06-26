"use server"

import { pool, handleDbError } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function deleteTodo(id: number) {
  // Check if we're in demo mode (no DATABASE_URL)
  const isDemoMode = !process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === ""

  // In demo mode, just return success (the UI will handle it)
  if (isDemoMode) {
    return { success: true }
  }

  try {
    await pool.query("DELETE FROM todos WHERE id = $1", [id])
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return handleDbError(error, "delete todo")
  }
}
