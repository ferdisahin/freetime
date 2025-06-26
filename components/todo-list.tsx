"use client"

import type React from "react"

import { useState } from "react"
import type { Todo } from "@/lib/types"
import { addTodo } from "@/actions/add-todo"
import { toggleTodo } from "@/actions/toggle-todo"
import { deleteTodo } from "@/actions/delete-todo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash, Loader2, Plus } from "lucide-react"

export default function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [newTodo, setNewTodo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingTodos, setPendingTodos] = useState<Record<number | string, "add" | "delete" | "toggle">>({})

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    // Create a temporary ID for the optimistic todo
    const tempId = `temp-${Date.now()}`

    // Create optimistic todo
    const optimisticTodo: Todo & { tempId?: string } = {
      id: -1, // Placeholder ID that won't be used for server operations
      text: newTodo,
      completed: false,
      created_at: new Date().toISOString(),
      tempId, // Store the temporary ID to identify this todo later
    }

    // Add optimistic todo to the list
    setTodos((prev) => [optimisticTodo, ...prev])
    setNewTodo("")
    setPendingTodos((prev) => ({ ...prev, [tempId]: "add" }))

    try {
      // Create FormData for the server action
      const formData = new FormData()
      formData.append("text", newTodo)

      // Actual server request
      const result = await addTodo(formData)

      // Check if the result is a valid todo
      if (result && "id" in result) {
        // Replace the optimistic todo with the real one from the server
        setTodos((prev) =>
          prev.map((todo) =>
            // Use the tempId to identify the optimistic todo
            "tempId" in todo && todo.tempId === tempId ? result : todo,
          ),
        )
      } else {
        // If we didn't get a valid todo back, remove the optimistic one
        setTodos((prev) => prev.filter((todo) => !("tempId" in todo && todo.tempId === tempId)))
      }
    } catch (error) {
      console.error("Failed to add todo:", error)
      // Remove optimistic todo on error
      setTodos((prev) => prev.filter((todo) => !("tempId" in todo && todo.tempId === tempId)))
    } finally {
      setPendingTodos((prev) => {
        const updated = { ...prev }
        delete updated[tempId]
        return updated
      })
    }
  }

  const handleToggleTodo = async (id: number) => {
    // Skip if this is a temporary ID
    if (id < 0) return

    // Optimistically update the UI
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
    setPendingTodos((prev) => ({ ...prev, [id]: "toggle" }))

    try {
      // Actual server request
      await toggleTodo(id)
    } catch (error) {
      console.error("Failed to toggle todo:", error)
      // Revert on error
      setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
    } finally {
      setPendingTodos((prev) => {
        const updated = { ...prev }
        delete updated[id]
        return updated
      })
    }
  }

  const handleDeleteTodo = async (id: number) => {
    // Skip if this is a temporary ID
    if (id < 0) {
      // For temporary todos, just remove them from the UI
      setTodos((prev) => prev.filter((todo) => todo.id !== id))
      return
    }

    // Optimistically remove from UI
    const todoToDelete = todos.find((todo) => todo.id === id)
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
    setPendingTodos((prev) => ({ ...prev, [id]: "delete" }))

    try {
      // Actual server request
      await deleteTodo(id)
    } catch (error) {
      console.error("Failed to delete todo:", error)
      // Restore on error
      if (todoToDelete) {
        setTodos((prev) => [...prev, todoToDelete])
      }
    } finally {
      setPendingTodos((prev) => {
        const updated = { ...prev }
        delete updated[id]
        return updated
      })
    }
  }

  return (
    <div className="w-full max-w-md mx-auto h-full">
      <form onSubmit={handleAddTodo} className="flex gap-2 mb-6">
        <Input
          type="text"
          placeholder="Add a new task..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!newTodo.trim()} aria-label="Add todo">
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      <ul className="space-y-2 min-h-[200px]">
        {todos.length === 0 ? (
          <li className="text-center text-muted-foreground py-4">No todos yet. Add one above!</li>
        ) : (
          todos.map((todo) => {
            // Use tempId for pending state if it exists, otherwise use id
            const pendingKey = "tempId" in todo && todo.tempId ? todo.tempId : todo.id
            const isPending = pendingTodos[pendingKey]

            // Determine if this is a temporary todo that's still pending
            const isTemporaryTodo = todo.id < 0

            return (
              <li
                key={"tempId" in todo && todo.tempId ? todo.tempId : todo.id}
                className={`flex items-center justify-between py-3 px-1 border-b border-border last:border-0 ${
                  isPending === "add" || isTemporaryTodo ? "animate-pulse bg-muted/20" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`todo-${todo.id}`}
                    checked={todo.completed}
                    onCheckedChange={() => handleToggleTodo(todo.id)}
                    disabled={!!isPending || isTemporaryTodo}
                  />
                  <label
                    htmlFor={`todo-${todo.id}`}
                    className={`text-sm ${todo.completed ? "line-through text-muted-foreground" : ""}`}
                  >
                    {todo.text}
                  </label>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteTodo(todo.id)}
                  disabled={!!isPending}
                  aria-label="Delete todo"
                  className="h-8 w-8"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                </Button>
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}
