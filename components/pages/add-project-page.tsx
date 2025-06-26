"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ProjectFormTabs } from "@/components/project-form-tabs"
import { ProjectTypeModal } from "@/components/project-type-modal"
import type { Client, ProjectFormData, User, ProjectType } from "@/lib/types"
import { createProjectAction } from "@/actions/project-actions"
import { getClientsAction } from "@/actions/client-actions"

interface AddProjectPageProps {
  user: User
  selectedType?: ProjectType
}

export function AddProjectPage({ user, selectedType }: AddProjectPageProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // Modal sadece selectedType yoksa açılsın
  const [showTypeModal, setShowTypeModal] = useState(!selectedType)
  const [projectType, setProjectType] = useState<ProjectType>(selectedType || "frontend")
  // Modal bir kez kapatıldıktan sonra tekrar açılmasın
  const [modalClosed, setModalClosed] = useState(!!selectedType)
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

  const handleAddProject = async (projectData: ProjectFormData) => {
    const result = await createProjectAction(projectData)
    if (result.success) {
      router.push("/projects")
    } else {
      alert(result.error)
    }
  }

  const handleProjectTypeSelect = (type: ProjectType) => {
    setProjectType(type)
    setShowTypeModal(false)
    setModalClosed(true)
  }

  const handleModalClose = () => {
    setShowTypeModal(false)
    setModalClosed(true)
    router.push("/projects")
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
        {showTypeModal && !modalClosed ? (
          <ProjectTypeModal
            isOpen={true}
            onClose={handleModalClose}
            onSelect={handleProjectTypeSelect}
          />
        ) : (
          <ProjectFormTabs
            onSubmit={handleAddProject}
            onCancel={() => router.push("/projects")}
            clients={clients}
            initialProjectType={projectType}
          />
        )}
      </div>
    </div>
  )
}
