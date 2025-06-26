import type { Todo } from "@/lib/types"

export const TODOS_KEY = "todos"

export const DEMO_TODOS: Todo[] = [
  {
    id: 1,
    text: "Learn about Neon Postgres",
    completed: false,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
  },
  {
    id: 2,
    text: "Connect Neon integration",
    completed: false,
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: 3,
    text: "Build awesome apps with serverless Postgres",
    completed: true,
    created_at: new Date(Date.now()).toISOString(),
  },
]
