import { pool, handleDbError } from "@/lib/db"
import type { Todo } from "@/lib/types"
import { DEMO_TODOS } from "@/lib/constants"

export async function getTodos(): Promise<Todo[]> {
  // Check if we're in demo mode (no DATABASE_URL)
  const isDemoMode = !process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === ""

  // Return demo data if in demo mode
  if (isDemoMode) {
    return DEMO_TODOS
  }

  // Otherwise, fetch from the database
  try {
    const result = await pool.query("SELECT * FROM todos ORDER BY created_at DESC")
    return result.rows
  } catch (error) {
    handleDbError(error, "fetch todos")
    return []
  }
}
