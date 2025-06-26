"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ProjectFormTabs } from "@/components/project-form-tabs"
import type { Project, Client, ProjectFormData, User } from "@/lib/types"
import { updateProjectAction } from "@/actions/project-actions"
import { getClientsAction } from "@/actions/client-actions"

interface EditProjectPageProps {
  user: User
  project: Project
}

export function EditProjectPage({ user, project }: EditProjectPageProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadClients = async () => {
      const result = await getClientsAction()
      if (result.success) {
        setClients(result.data)
      }
      setIsLoading(false)
    }

    loadClients()
  }, [])

  const handleUpdateProject = async (projectData: ProjectFormData) => {
    const result = await updateProjectAction(project.id, projectData)
    if (result.success) {
      router.push("/projects")
    } else {
      alert(result.error)
    }
  }

  const initialData: ProjectFormData = {
    name: project.name,
    clientId: project.clientId,
    projectType: project.projectType,
    status: project.status,
    totalPages: project.totalPages,
    completedPages: project.completedPages,
    pricePerPage: project.pricePerPage,
    fixedPrice: project.fixedPrice,
    completionPercentage: project.completionPercentage,
    extraHours: project.extraHours,
    extraHourRate: project.extraHourRate,
    notes: project.notes,
    totalAmount: project.totalAmount,
    paidAmount: project.paidAmount,
    paymentStatus: project.paymentStatus,
    startDate: project.startDate,
    deadline: project.deadline,
    category: project.category,
    priority: project.priority,
    estimatedHours: project.estimatedHours,
    actualHours: project.actualHours,
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
      <Header user={user} onSettingsClick={() => router.push("/settings")} />
      <div className="container mx-auto py-8 px-4">
        <ProjectFormTabs
          onSubmit={handleUpdateProject}
          onCancel={() => router.push("/projects")}
          clients={clients}
          initialData={initialData}
          isEditing={true}
        />
      </div>
    </div>
  )
}
