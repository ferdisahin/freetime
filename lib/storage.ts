import type { Project, Client } from "./types"

const PROJECTS_KEY = "freelance-projects"
const CLIENTS_KEY = "freelance-clients"

// Client functions
export function getClients(): Client[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(CLIENTS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function saveClients(clients: Client[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients))
  } catch (error) {
    console.error("Müşteriler kaydedilemedi:", error)
  }
}

export function addClient(clientData: Omit<Client, "id" | "createdAt">): Client {
  const clients = getClients()
  const newClient: Client = {
    ...clientData,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  }

  const updatedClients = [newClient, ...clients]
  saveClients(updatedClients)
  return newClient
}

export function updateClient(id: number, updates: Partial<Client>): void {
  const clients = getClients()
  const updatedClients = clients.map((c) => (c.id === id ? { ...c, ...updates } : c))
  saveClients(updatedClients)
}

export function deleteClient(id: number): void {
  const clients = getClients()
  const filteredClients = clients.filter((c) => c.id !== id)
  saveClients(filteredClients)
}

// Project functions
export function getProjects(): Project[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(PROJECTS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function saveProjects(projects: Project[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
  } catch (error) {
    console.error("Projeler kaydedilemedi:", error)
  }
}

export function addProject(projectData: Omit<Project, "id" | "createdAt" | "updatedAt">): Project {
  const projects = getProjects()
  const now = new Date().toISOString()
  const newProject: Project = {
    ...projectData,
    id: Date.now(),
    createdAt: now,
    updatedAt: now,
  }

  const updatedProjects = [newProject, ...projects]
  saveProjects(updatedProjects)
  return newProject
}

export function updateProject(id: number, updates: Partial<Project>): void {
  const projects = getProjects()
  const updatedProjects = projects.map((p) =>
    p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p,
  )
  saveProjects(updatedProjects)
}

export function deleteProject(id: number): void {
  const projects = getProjects()
  const filteredProjects = projects.filter((p) => p.id !== id)
  saveProjects(filteredProjects)
}
