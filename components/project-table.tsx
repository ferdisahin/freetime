"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Edit, Plus, Search, Users, Share2 } from "lucide-react"
import type { Project, Client, ProjectStatus } from "@/lib/types"
import { calculateProjectPrice, formatCurrency, getStatusLabel, getStatusColor, getClientTypeLabel } from "@/lib/utils"
import { Pagination } from "./pagination"

interface ProjectTableProps {
  projects: Project[]
  clients: Client[]
  onDelete: (id: number) => void
  onEdit: (project: Project) => void
  onShare: (project: Project) => void // Bu satırı ekleyin
  onAddNew: () => void
  onManageClients: () => void
}

const ITEMS_PER_PAGE = 10

export function ProjectTable({
  projects,
  clients,
  onDelete,
  onEdit,
  onShare,
  onAddNew,
  onManageClients,
}: ProjectTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all")
  const [clientFilter, setClientFilter] = useState<number | "all">("all")

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const client = clients.find((c) => c.id === project.clientId)
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    const matchesClient = clientFilter === "all" || project.clientId === clientFilter

    return matchesSearch && matchesStatus && matchesClient
  })

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const totalEarnings = filteredProjects.reduce((sum, project) => sum + calculateProjectPrice(project), 0)

  const getClientName = (clientId: number) => {
    const client = clients.find((c) => c.id === clientId)
    return client ? client.name : "Bilinmeyen Müşteri"
  }

  const getClientType = (clientId: number) => {
    const client = clients.find((c) => c.id === clientId)
    return client ? getClientTypeLabel(client.type) : ""
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Freelance Projelerim</h1>
          <p className="text-muted-foreground">
            Toplam {filteredProjects.length} proje • Toplam kazanç: {formatCurrency(totalEarnings)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onManageClients} variant="outline" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Müşteriler
          </Button>
          <Button onClick={onAddNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Yeni Proje
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Proje veya müşteri ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value: ProjectStatus | "all") => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Durum filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="pending">Beklemede</SelectItem>
                <SelectItem value="in-progress">Devam Ediyor</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="on-hold">Askıda</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={clientFilter.toString()}
              onValueChange={(value) => setClientFilter(value === "all" ? "all" : Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Müşteri filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Müşteriler</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setClientFilter("all")
                setCurrentPage(1)
              }}
            >
              Filtreleri Temizle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      {paginatedProjects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {projects.length === 0 ? "Henüz proje eklenmemiş" : "Filtrelere uygun proje bulunamadı"}
            </p>
            {projects.length === 0 && <Button onClick={onAddNew}>İlk Projenizi Ekleyin</Button>}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Proje Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Proje</th>
                    <th className="text-left p-3 font-medium">Müşteri</th>
                    <th className="text-left p-3 font-medium">Durum</th>
                    <th className="text-left p-3 font-medium">Sayfa</th>
                    <th className="text-left p-3 font-medium">Tamamlanan</th>
                    <th className="text-left p-3 font-medium">Sayfa Ücreti</th>
                    <th className="text-left p-3 font-medium">Ekstra</th>
                    <th className="text-left p-3 font-medium">Toplam</th>
                    <th className="text-left p-3 font-medium">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProjects.map((project) => (
                    <tr key={project.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{project.name}</div>
                          {project.notes && (
                            <div className="text-sm text-muted-foreground truncate max-w-32">{project.notes}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{getClientName(project.clientId)}</div>
                          <div className="text-sm text-muted-foreground">{getClientType(project.clientId)}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={`${getStatusColor(project.status)} text-white`}>
                          {getStatusLabel(project.status)}
                        </Badge>
                      </td>
                      <td className="p-3">{project.totalPages}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              project.completedPages === project.totalPages ? "text-green-600 font-medium" : ""
                            }
                          >
                            {project.completedPages}
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${project.totalPages > 0 ? (project.completedPages / project.totalPages) * 100 : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{formatCurrency(project.pricePerPage)}</td>
                      <td className="p-3">
                        {project.extraHours > 0 && (
                          <div className="text-sm">
                            <div>{project.extraHours}h</div>
                            <div className="text-muted-foreground">{formatCurrency(project.extraHourRate)}/h</div>
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-medium text-green-600">
                        {formatCurrency(calculateProjectPrice(project))}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(project)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Düzenle"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onShare(project)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Paylaş"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(project.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
