"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Copy,
  Check,
  Building2,
  User,
  Mail,
  Phone,
  BarChart3,
  Clock,
  CheckCircle,
  CreditCard,
  Calendar,
  TrendingUp,
  FileText,
  Eye,
  DollarSign,
  Target,
  Activity,
} from "lucide-react"
import type { Project, Client } from "@/lib/types"
import {
  formatCurrency,
  formatDate,
  getStatusLabel,
  getStatusColor,
  getPaymentStatusLabel,
  getPaymentStatusColor,
  getProjectTypeLabel,
  getProjectTypeColor,
  getPriorityLabel,
  getPriorityColor,
  calculateDaysRemaining,
  calculateProgress,
} from "@/lib/utils"

interface ClientDashboardProps {
  client: Client
  projects: Project[]
}

export function ClientDashboard({ client, projects }: ClientDashboardProps) {
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  useEffect(() => {
    if (client.shareToken) {
      setShareUrl(`${window.location.origin}/client/${client.shareToken}`)
    }
  }, [client.shareToken])

  const copyToClipboard = async () => {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Kopyalama hatası:", error)
    }
  }

  // İstatistikleri hesapla
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => ["pending", "in-progress"].includes(p.status)).length,
    completedProjects: projects.filter((p) => p.status === "completed").length,
    onHoldProjects: projects.filter((p) => p.status === "on-hold").length,
    totalAmount: projects.reduce((sum, p) => sum + p.totalAmount, 0),
    paidAmount: projects.reduce((sum, p) => sum + p.paidAmount, 0),
    pendingAmount: projects.reduce((sum, p) => sum + (p.totalAmount - p.paidAmount), 0),
    thisMonthProjects: projects.filter((p) => {
      const projectDate = new Date(p.createdAt)
      const now = new Date()
      return projectDate.getMonth() === now.getMonth() && projectDate.getFullYear() === now.getFullYear()
    }).length,
  }

  const paymentProgress = stats.totalAmount > 0 ? (stats.paidAmount / stats.totalAmount) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                {client.type === "corporate" ? (
                  <Building2 className="h-8 w-8 text-blue-600" />
                ) : (
                  <User className="h-8 w-8 text-blue-600" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
                <p className="text-gray-600">
                  {client.type === "corporate" ? "Kurumsal Müşteri" : "Bireysel Müşteri"}
                  {client.company && ` • ${client.company}`}
                </p>
              </div>
            </div>

            {/* İletişim Bilgileri */}
            <div className="hidden md:flex items-center gap-6">
              {client.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${client.email}`} className="hover:text-blue-600 transition-colors">
                    {client.email}
                  </a>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${client.phone}`} className="hover:text-blue-600 transition-colors">
                    {client.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Paylaşım Linki */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Portal Linki:</span>
              <div className="flex-1 flex gap-2">
                <Input value={shareUrl} readOnly className="bg-white text-sm" />
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Projeler</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
                  <p className="text-xs text-gray-500 mt-1">Bu ay: {stats.thisMonthProjects}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aktif Projeler</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.activeProjects}</p>
                  <p className="text-xs text-gray-500 mt-1">Askıda: {stats.onHoldProjects}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completedProjects}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    %{stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}{" "}
                    başarı
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Değer</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalAmount)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Ortalama: {formatCurrency(stats.totalAmount / (stats.totalProjects || 1))}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ödeme Durumu Kartı */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Ödeme Durumu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Genel Ödeme İlerlemesi</span>
                <span className="text-2xl font-bold text-green-600">%{Math.round(paymentProgress)}</span>
              </div>

              <Progress value={paymentProgress} className="h-3" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.paidAmount)}</div>
                  <div className="text-sm text-gray-600">Ödenen Tutar</div>
                  <div className="text-xs text-gray-500 mt-1">%{Math.round(paymentProgress)} tamamlandı</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.pendingAmount)}</div>
                  <div className="text-sm text-gray-600">Bekleyen Ödeme</div>
                  <div className="text-xs text-gray-500 mt-1">%{Math.round(100 - paymentProgress)} kalan</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalAmount)}</div>
                  <div className="text-sm text-gray-600">Toplam Tutar</div>
                  <div className="text-xs text-gray-500 mt-1">{stats.totalProjects} proje</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projeler Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Tüm Projeler ({projects.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Aktif ({stats.activeProjects})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Tamamlanan ({stats.completedProjects})
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Ödemeler
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ProjectGrid projects={projects} onProjectSelect={setSelectedProject} />
          </TabsContent>

          <TabsContent value="active">
            <ProjectGrid
              projects={projects.filter((p) => ["pending", "in-progress"].includes(p.status))}
              onProjectSelect={setSelectedProject}
            />
          </TabsContent>

          <TabsContent value="completed">
            <ProjectGrid
              projects={projects.filter((p) => p.status === "completed")}
              onProjectSelect={setSelectedProject}
            />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentHistory projects={projects} />
          </TabsContent>
        </Tabs>

        {/* Proje Detay Modal */}
        {selectedProject && <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
      </div>
    </div>
  )
}

function ProjectGrid({
  projects,
  onProjectSelect,
}: {
  projects: Project[]
  onProjectSelect: (project: Project) => void
}) {
  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Bu kategoride proje bulunmuyor</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => {
        const progress = calculateProgress(project)
        const daysRemaining = calculateDaysRemaining(project.deadline)
        const paymentProgress = project.totalAmount > 0 ? (project.paidAmount / project.totalAmount) * 100 : 0

        return (
          <Card
            key={project.id}
            className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500"
            onClick={() => onProjectSelect(project)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2 line-clamp-1">{project.name}</CardTitle>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className={`${getStatusColor(project.status)} text-white text-xs`}>
                      {getStatusLabel(project.status)}
                    </Badge>
                    <Badge className={`${getProjectTypeColor(project.projectType)} text-white text-xs`}>
                      {getProjectTypeLabel(project.projectType)}
                    </Badge>
                    <Badge className={`${getPriorityColor(project.priority)} text-white text-xs`}>
                      {getPriorityLabel(project.priority)}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Proje İlerlemesi */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Proje İlerlemesi</span>
                  <span className="font-bold text-blue-600">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                {project.projectType === "frontend" && (
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>
                      {project.completedPages || 0} / {project.totalPages || 0} sayfa
                    </span>
                    <span>
                      {project.totalPages ? Math.round(((project.completedPages || 0) / project.totalPages) * 100) : 0}%
                    </span>
                  </div>
                )}
              </div>

              {/* Ödeme Durumu */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Ödeme Durumu</span>
                  <Badge className={`${getPaymentStatusColor(project.paymentStatus)} text-white text-xs`}>
                    {getPaymentStatusLabel(project.paymentStatus)}
                  </Badge>
                </div>
                <Progress value={paymentProgress} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{formatCurrency(project.paidAmount)} ödendi</span>
                  <span>{formatCurrency(project.totalAmount - project.paidAmount)} kalan</span>
                </div>
              </div>

              <Separator />

              {/* Tutar ve Tarih */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Toplam Tutar:</span>
                  <span className="font-bold text-lg">{formatCurrency(project.totalAmount)}</span>
                </div>

                {project.startDate && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Başlangıç:</span>
                    <span>{formatDate(project.startDate)}</span>
                  </div>
                )}

                {daysRemaining !== null && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Teslim:</span>
                    <span
                      className={`font-medium ${
                        daysRemaining < 0 ? "text-red-600" : daysRemaining < 7 ? "text-yellow-600" : "text-green-600"
                      }`}
                    >
                      {daysRemaining < 0 ? `${Math.abs(daysRemaining)} gün gecikme` : `${daysRemaining} gün kaldı`}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function PaymentHistory({ projects }: { projects: Project[] }) {
  const sortedProjects = [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Ödeme Geçmişi ve Detayları
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedProjects.map((project) => {
            const paymentProgress = project.totalAmount > 0 ? (project.paidAmount / project.totalAmount) * 100 : 0

            return (
              <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-lg">{project.name}</h3>
                    <p className="text-sm text-gray-600">{getProjectTypeLabel(project.projectType)}</p>
                  </div>
                  <Badge className={`${getPaymentStatusColor(project.paymentStatus)} text-white`}>
                    {getPaymentStatusLabel(project.paymentStatus)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{formatCurrency(project.totalAmount)}</div>
                    <div className="text-xs text-gray-600">Toplam Tutar</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{formatCurrency(project.paidAmount)}</div>
                    <div className="text-xs text-gray-600">Ödenen ({Math.round(paymentProgress)}%)</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-xl font-bold text-red-600">
                      {formatCurrency(project.totalAmount - project.paidAmount)}
                    </div>
                    <div className="text-xs text-gray-600">Kalan Ödeme</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Ödeme İlerlemesi</span>
                    <span className="font-medium">{Math.round(paymentProgress)}%</span>
                  </div>
                  <Progress value={paymentProgress} className="h-2" />
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Son güncelleme: {formatDate(project.updatedAt)}</span>
                  {project.deadline && <span>Teslim tarihi: {formatDate(project.deadline)}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function ProjectDetailModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const progress = calculateProgress(project)
  const daysRemaining = calculateDaysRemaining(project.deadline)
  const paymentProgress = project.totalAmount > 0 ? (project.paidAmount / project.totalAmount) * 100 : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div>
            <CardTitle className="text-2xl">{project.name}</CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge className={`${getStatusColor(project.status)} text-white`}>{getStatusLabel(project.status)}</Badge>
              <Badge className={`${getProjectTypeColor(project.projectType)} text-white`}>
                {getProjectTypeLabel(project.projectType)}
              </Badge>
              <Badge className={`${getPaymentStatusColor(project.paymentStatus)} text-white`}>
                {getPaymentStatusLabel(project.paymentStatus)}
              </Badge>
              <Badge className={`${getPriorityColor(project.priority)} text-white`}>
                {getPriorityLabel(project.priority)}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} size="sm">
            ✕
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* İlerleme ve Ödeme Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Proje İlerlemesi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">{Math.round(progress)}%</div>
                    <Progress value={progress} className="h-3" />
                  </div>

                  {project.projectType === "frontend" ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{project.completedPages || 0}</div>
                        <div className="text-sm text-gray-600">Tamamlanan Sayfa</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-600">{project.totalPages || 0}</div>
                        <div className="text-sm text-gray-600">Toplam Sayfa</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-3 bg-indigo-50 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-600">{project.completionPercentage || 0}%</div>
                      <div className="text-sm text-gray-600">Tamamlanma Oranı</div>
                    </div>
                  )}

                  {project.estimatedHours && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Tahmini Süre:</span>
                        <div className="font-medium">{project.estimatedHours} saat</div>
                      </div>
                      {project.actualHours && (
                        <div>
                          <span className="text-gray-600">Gerçek Süre:</span>
                          <div className="font-medium">{project.actualHours} saat</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Ödeme Detayları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">{Math.round(paymentProgress)}%</div>
                    <Progress value={paymentProgress} className="h-3" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-gray-700">Toplam Tutar:</span>
                      <span className="font-bold text-xl">{formatCurrency(project.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-700">Ödenen:</span>
                      <span className="font-bold text-xl text-green-600">{formatCurrency(project.paidAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-gray-700">Kalan:</span>
                      <span className="font-bold text-xl text-red-600">
                        {formatCurrency(project.totalAmount - project.paidAmount)}
                      </span>
                    </div>
                  </div>

                  {project.projectType === "frontend" && project.pricePerPage && (
                    <div className="text-sm text-gray-600 text-center">
                      Sayfa başı: {formatCurrency(project.pricePerPage)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tarih Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Tarih Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Başlangıç</div>
                  <div className="font-medium">{formatDate(project.startDate || "")}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Teslim Tarihi</div>
                  <div className="font-medium">{formatDate(project.deadline || "")}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Oluşturulma</div>
                  <div className="font-medium">{formatDate(project.createdAt)}</div>
                </div>
                {daysRemaining !== null && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Kalan Süre</div>
                    <div
                      className={`font-medium ${
                        daysRemaining < 0 ? "text-red-600" : daysRemaining < 7 ? "text-yellow-600" : "text-green-600"
                      }`}
                    >
                      {daysRemaining < 0 ? `${Math.abs(daysRemaining)} gün gecikme` : `${daysRemaining} gün`}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Proje Detayları */}
          {(project.notes || project.category) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Proje Detayları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.category && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Kategori:</span>
                    <div className="mt-1">
                      <Badge variant="outline">{project.category}</Badge>
                    </div>
                  </div>
                )}
                {project.notes && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Proje Notları:</span>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">{project.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
