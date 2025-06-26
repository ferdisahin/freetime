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
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      type: "backend" as ProjectType,
      title: "Backend Projesi",
      description: "Sunucu tarafı, API ve veritabanı odaklı projeler",
      icon: Server,
      features: ["Sabit fiyat", "API geliştirme", "Veritabanı tasarımı", "Sunucu yönetimi"],
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      type: "fullstack" as ProjectType,
      title: "Full-Stack Projesi",
      description: "Hem frontend hem backend içeren kapsamlı projeler",
      icon: Layers,
      features: ["Sabit fiyat", "Tam çözüm", "Frontend + Backend", "Kapsamlı geliştirme"],
      color: "bg-indigo-500",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
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
                  className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${projectType.borderColor} hover:scale-105`}
                  onClick={() => onSelect(projectType.type)}
                >
                  <CardHeader className="text-center">
                    <div className={`mx-auto p-4 rounded-full ${projectType.bgColor} w-fit`}>
                      <Icon className={`h-8 w-8 text-white ${projectType.color.replace("bg-", "text-")}`} />
                    </div>
                    <CardTitle className="text-xl">{projectType.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{projectType.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {projectType.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${projectType.color}`} />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button className={`w-full ${projectType.color} hover:opacity-90`}>{projectType.title} Seç</Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="text-center text-sm text-muted-foreground">
            <p>💡 İpucu: Proje tipini daha sonra değiştirebilirsiniz</p>
          </div>
        </div>
      </div>
    </div>
  )
}
