"use server"

import { pool } from "@/lib/db"
import { revalidatePath } from "next/cache"
import type { Todo } from "@/lib/types"

export async function addTodo(formData: FormData) {
  const text = formData.get("text") as string

  if (!text || text.trim() === "") {
    return { error: "Todo text cannot be empty" }
  }

  // Check if we're in demo mode (no DATABASE_URL)
  const isDemoMode = !process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === ""

  // In demo mode, create a demo todo
  if (isDemoMode) {
    const newTodo: Todo = {
      id: Date.now(), // Use timestamp as ID in demo mode
      text: text.trim(),
      completed: false,
      created_at: new Date().toISOString(),
    }

    return newTodo
  }

  try {
    // Insert the todo and return the created todo
    const result = await pool.query("INSERT INTO todos (text) VALUES ($1) RETURNING *", [text.trim()])

    revalidatePath("/")

    // Ensure we return a properly formatted Todo object
    const newTodo: Todo = {
      id: result.rows[0].id,
      text: result.rows[0].text,
      completed: result.rows[0].completed,
      created_at: result.rows[0].created_at,
    }

    return newTodo
  } catch (error) {
    console.error("Error adding todo:", error)
    return { error: `Failed to add todo: ${error}` }
  }
}
