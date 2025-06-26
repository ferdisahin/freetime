"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Monitor, Server, Layers, X } from "lucide-react"
import type { ProjectType } from "@/lib/types"

interface ProjectTypeModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (type: ProjectType) => void
}

export function ProjectTypeModal({ isOpen, onClose, onSelect }: ProjectTypeModalProps) {
  if (!isOpen) return null

  const projectTypes = [
    {
      type: "frontend" as ProjectType,
      title: "Frontend Projesi",
      description: "Web arayüzü, kullanıcı deneyimi odaklı projeler",
      icon: Monitor,
      features: ["Sayfa bazlı fiyatlandırma", "Responsive tasarım", "UI/UX odaklı", "HTML, CSS, JavaScript"],
    },
    {
      type: "backend" as ProjectType,
      title: "Backend Projesi",
      description: "Sunucu tarafı, API ve veritabanı odaklı projeler",
      icon: Server,
      features: ["Sabit fiyat", "API geliştirme", "Veritabanı tasarımı", "Sunucu yönetimi"],
    },
    {
      type: "fullstack" as ProjectType,
      title: "Full-Stack Projesi",
      description: "Hem frontend hem backend içeren kapsamlı projeler",
      icon: Layers,
      features: ["Sabit fiyat", "Tam çözüm", "Frontend + Backend", "Kapsamlı geliştirme"],
    },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Proje Tipi Seçin</h2>
            <p className="text-muted-foreground">Projenizin türüne göre fiyatlandırma sistemi belirlenecek</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projectTypes.map((projectType) => {
              const Icon = projectType.icon
              return (
                <Card
                  key={projectType.type}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-primary"
                  onClick={() => onSelect(projectType.type)}
                >
                  <CardHeader className="text-center">
                    <div className="mx-auto p-4 rounded-full bg-muted w-fit">
                      <Icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl">{projectType.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{projectType.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {projectType.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button className="w-full" variant="default">
                      {projectType.title} Seç
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="p-6 border-t bg-muted/30">
          <div className="text-center text-sm text-muted-foreground">
            <p>💡 İpucu: Proje tipini daha sonra değiştirebilirsiniz</p>
          </div>
        </div>
      </div>
    </div>
  )
}
