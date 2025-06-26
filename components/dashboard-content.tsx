"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { ProjectTable } from "@/components/project-table"
import { ProjectForm } from "@/components/project-form"
import { ClientTable } from "@/components/client-table"
import { ClientForm } from "@/components/client-form"
import { SettingsForm } from "@/components/settings-form"
import type { Project, Client, ProjectFormData, ClientFormData, User } from "@/lib/types"
import {
  getProjectsAction,
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
} from "@/actions/project-actions"
import { getClientsAction, createClientAction, updateClientAction, deleteClientAction } from "@/actions/client-actions"

type View = "projects" | "project-form" | "clients" | "client-form" | "settings"

interface DashboardContentProps {
  user: User
}

export function DashboardContent({ user }: DashboardContentProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [currentView, setCurrentView] = useState<View>("projects")
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      // Load projects and clients
      const [projectsResult, clientsResult] = await Promise.all([getProjectsAction(), getClientsAction()])

      if (projectsResult.success) {
        setProjects(projectsResult.data)
      }

      if (clientsResult.success) {
        setClients(clientsResult.data)
      }

      setIsLoading(false)
    }

    loadData()
  }, [])

  // Project handlers
  const handleAddProject = async (projectData: ProjectFormData) => {
    const result = await createProjectAction(projectData)
    if (result.success) {
      setProjects((prev) => [result.data, ...prev])
      setCurrentView("projects")
    } else {
      alert(result.error)
    }
  }

  const handleUpdateProject = async (projectData: ProjectFormData) => {
    if (editingProject) {
      const result = await updateProjectAction(editingProject.id, projectData)
      if (result.success) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === editingProject.id ? { ...p, ...projectData, updatedAt: new Date().toISOString() } : p,
          ),
        )
        setEditingProject(null)
        setCurrentView("projects")
      } else {
        alert(result.error)
      }
    }
  }

  const handleDeleteProject = async (id: number) => {
    if (confirm("Bu projeyi silmek istediğinizden emin misiniz?")) {
      const result = await deleteProjectAction(id)
      if (result.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id))
      } else {
        alert(result.error)
      }
    }
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setCurrentView("project-form")
  }

  // Client handlers
  const handleAddClient = async (clientData: ClientFormData) => {
    const result = await createClientAction(clientData)
    if (result.success) {
      setClients((prev) => [result.data, ...prev])
      setCurrentView("clients")
    } else {
      alert(result.error)
    }
  }

  const handleUpdateClient = async (clientData: ClientFormData) => {
    if (editingClient) {
      const result = await updateClientAction(editingClient.id, clientData)
      if (result.success) {
        setClients((prev) => prev.map((c) => (c.id === editingClient.id ? { ...c, ...clientData } : c)))
        setEditingClient(null)
        setCurrentView("clients")
      } else {
        alert(result.error)
      }
    }
  }

  const handleDeleteClient = async (id: number) => {
    if (confirm("Bu müşteriyi silmek istediğinizden emin misiniz?")) {
      const result = await deleteClientAction(id)
      if (result.success) {
        setClients((prev) => prev.filter((c) => c.id !== id))
      } else {
        alert(result.error)
      }
    }
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setCurrentView("client-form")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Veriler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onSettingsClick={() => setCurrentView("settings")} />

      <div className="container mx-auto py-8 px-4">
        {currentView === "projects" && (
          <ProjectTable
            projects={projects}
            clients={clients}
            onDelete={handleDeleteProject}
            onEdit={handleEditProject}
            onAddNew={() => setCurrentView("project-form")}
            onManageClients={() => setCurrentView("clients")}
          />
        )}

        {currentView === "project-form" && (
          <ProjectForm
            onSubmit={editingProject ? handleUpdateProject : handleAddProject}
            onCancel={() => {
              setEditingProject(null)
              setCurrentView("projects")
            }}
            clients={clients}
            initialData={editingProject || undefined}
            isEditing={!!editingProject}
          />
        )}

        {currentView === "clients" && (
          <ClientTable
            clients={clients}
            onDelete={handleDeleteClient}
            onEdit={handleEditClient}
            onAddNew={() => setCurrentView("client-form")}
            onBack={() => setCurrentView("projects")}
          />
        )}

        {currentView === "client-form" && (
          <ClientForm
            onSubmit={editingClient ? handleUpdateClient : handleAddClient}
            onCancel={() => {
              setEditingClient(null)
              setCurrentView("clients")
            }}
            initialData={editingClient || undefined}
            isEditing={!!editingClient}
          />
        )}

        {currentView === "settings" && <SettingsForm onBack={() => setCurrentView("projects")} />}
      </div>
    </div>
  )
}
