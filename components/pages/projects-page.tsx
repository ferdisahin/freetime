"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ProjectTable } from "@/components/project-table"
import type { Project, Client, User } from "@/lib/types"
import { getProjectsAction, deleteProjectAction } from "@/actions/project-actions"
import { getClientsAction } from "@/actions/client-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check, Share2, X } from "lucide-react"

interface ProjectsPageProps {
  user: User
}

export function ProjectsPage({ user }: ProjectsPageProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [shareProject, setShareProject] = useState<Project | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
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
    router.push(`/projects/edit/${project.id}`)
  }

  const handleShareProject = (project: Project) => {
    setShareProject(project)
  }

  const copyShareUrl = async () => {
    if (!shareProject?.shareToken) return

    const shareUrl = `${window.location.origin}/share/${shareProject.shareToken}`

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Kopyalama hatası:", error)
    }
  }

  const closeShareModal = () => {
    setShareProject(null)
    setCopied(false)
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
        <ProjectTable
          projects={projects}
          clients={clients}
          onDelete={handleDeleteProject}
          onEdit={handleEditProject}
          onShare={handleShareProject}
          onAddNew={() => router.push("/projects/add")}
          onManageClients={() => router.push("/clients")}
        />
      </div>

      {/* Share Modal */}
      {shareProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Proje Paylaş
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={closeShareModal}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">{shareProject.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Bu link kalıcıdır ve müşteriniz her zaman proje detaylarını görebilir. Link değişmez ve sürekli
                  geçerlidir.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Paylaşım Linki:</label>
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}/share/${shareProject.shareToken}`}
                    readOnly
                    className="flex-1 text-sm"
                  />
                  <Button onClick={copyShareUrl} variant="outline" size="sm">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Kopyalandı" : "Kopyala"}
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 mt-0.5">
                    <Share2 className="h-4 w-4" />
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Kalıcı Link</p>
                    <p>Bu link değişmez ve müşteriniz istediği zaman proje durumunu kontrol edebilir.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={closeShareModal}>
                  Kapat
                </Button>
                <Button
                  onClick={() => {
                    window.open(`/share/${shareProject.shareToken}`, "_blank")
                  }}
                >
                  Önizleme
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
