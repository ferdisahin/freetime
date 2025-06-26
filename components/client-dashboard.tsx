"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Copy,
  Check,
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
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
  calculateDaysRemaining,
  calculateProgress,
} from "@/lib/utils"

interface ClientDashboardProps {
  client: Client
  projects: Project[]
}

export function ClientDashboard({ client, projects }: ClientDashboardProps) {
  const [copied, setCopied] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const shareUrl = `${window.location.origin}/client/${client.shareToken}`

  const copyToClipboard = async () => {
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
    totalAmount: projects.reduce((sum, p) => sum + p.totalAmount, 0),
    paidAmount: projects.reduce((sum, p) => sum + p.paidAmount, 0),
    pendingAmount: projects.reduce((sum, p) => sum + (p.totalAmount - p.paidAmount), 0),
  }

  const statCards = [
    {
      title: "Toplam Projeler",
      value: stats.totalProjects,
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Aktif Projeler",
      value: stats.activeProjects,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Tamamlanan",
      value: stats.completedProjects,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Toplam Tutar",
      value: formatCurrency(stats.totalAmount),
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Ödenen Tutar",
      value: formatCurrency(stats.paidAmount),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Bekleyen Ödeme",
      value: formatCurrency(stats.pendingAmount),
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/20 rounded-full">
              {client.type === "corporate" ? <Building2 className="h-8 w-8" /> : <User className="h-8 w-8" />}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{client.name}</h1>
              <p className="text-blue-100">
                {client.type === "corporate" ? "Kurumsal Müşteri" : "Bireysel Müşteri"}
                {client.company && ` • ${client.company}`}
              </p>
            </div>
          </div>

          {/* İletişim Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${client.email}`} className="hover:underline">
                  {client.email}
                </a>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href={`tel:${client.phone}`} className="hover:underline">
                  {client.phone}
                </a>
              </div>
            )}
          </div>

          {/* Paylaşım Linki */}
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-white">
                <span className="text-sm font-medium">Müşteri Portal Linki:</span>
                <div className="flex-1 flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="bg-white/20 border-white/30 text-white placeholder-white/70"
                  />
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="sm"
                    className="text-white border-white/30 hover:bg-white/20"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Ödeme Durumu Özeti */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ödeme Durumu Özeti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Ödeme İlerlemesi</span>
                <span className="text-sm text-muted-foreground">
                  %{stats.totalAmount > 0 ? Math.round((stats.paidAmount / stats.totalAmount) * 100) : 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-600 h-4 rounded-full transition-all"
                  style={{
                    width: `${stats.totalAmount > 0 ? (stats.paidAmount / stats.totalAmount) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalAmount)}</p>
                  <p className="text-sm text-muted-foreground">Toplam Tutar</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.paidAmount)}</p>
                  <p className="text-sm text-muted-foreground">Ödenen</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.pendingAmount)}</p>
                  <p className="text-sm text-muted-foreground">Kalan</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projeler */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Tüm Projeler ({projects.length})</TabsTrigger>
            <TabsTrigger value="active">Aktif ({stats.activeProjects})</TabsTrigger>
            <TabsTrigger value="completed">Tamamlanan ({stats.completedProjects})</TabsTrigger>
            <TabsTrigger value="payments">Ödemeler</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ProjectList projects={projects} onProjectSelect={setSelectedProject} />
          </TabsContent>

          <TabsContent value="active">
            <ProjectList
              projects={projects.filter((p) => ["pending", "in-progress"].includes(p.status))}
              onProjectSelect={setSelectedProject}
            />
          </TabsContent>

          <TabsContent value="completed">
            <ProjectList
              projects={projects.filter((p) => p.status === "completed")}
              onProjectSelect={setSelectedProject}
            />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsList projects={projects} />
          </TabsContent>
        </Tabs>

        {/* Proje Detay Modal */}
        {selectedProject && <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
      </div>
    </div>
  )
}

function ProjectList({
  projects,
  onProjectSelect,
}: { projects: Project[]; onProjectSelect: (project: Project) => void }) {
  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">Bu kategoride proje bulunmuyor</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => {
        const progress = calculateProgress(project)
        const daysRemaining = calculateDaysRemaining(project.deadline)

        return (
          <Card
            key={project.id}
            className="hover:shadow-lg transition-all cursor-pointer"
            onClick={() => onProjectSelect(project)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{project.name}</CardTitle>
                  <div className="flex gap-2 mb-2">
                    <Badge className={`${getStatusColor(project.status)} text-white`}>
                      {getStatusLabel(project.status)}
                    </Badge>
                    <Badge className={`${getProjectTypeColor(project.projectType)} text-white`}>
                      {getProjectTypeLabel(project.projectType)}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* İlerleme */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>İlerleme</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {/* Ödeme Durumu */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Ödeme:</span>
                <Badge className={`${getPaymentStatusColor(project.paymentStatus)} text-white`}>
                  {getPaymentStatusLabel(project.paymentStatus)}
                </Badge>
              </div>

              {/* Tutar */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tutar:</span>
                <span className="font-bold text-lg">{formatCurrency(project.totalAmount)}</span>
              </div>

              {/* Tarih */}
              {daysRemaining !== null && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Teslim:</span>
                  <span
                    className={`text-sm font-medium ${
                      daysRemaining < 0 ? "text-red-600" : daysRemaining < 7 ? "text-yellow-600" : "text-green-600"
                    }`}
                  >
                    {daysRemaining < 0 ? `${Math.abs(daysRemaining)} gün gecikme` : `${daysRemaining} gün`}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function PaymentsList({ projects }: { projects: Project[] }) {
  const sortedProjects = [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ödeme Geçmişi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedProjects.map((project) => (
            <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-sm text-muted-foreground">Son güncelleme: {formatDate(project.updatedAt)}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`${getPaymentStatusColor(project.paymentStatus)} text-white`}>
                    {getPaymentStatusLabel(project.paymentStatus)}
                  </Badge>
                </div>
                <p className="font-bold">{formatCurrency(project.totalAmount)}</p>
                <p className="text-sm text-muted-foreground">Ödenen: {formatCurrency(project.paidAmount)}</p>
                {project.totalAmount > project.paidAmount && (
                  <p className="text-sm text-red-600">
                    Kalan: {formatCurrency(project.totalAmount - project.paidAmount)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ProjectDetailModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const progress = calculateProgress(project)
  const daysRemaining = calculateDaysRemaining(project.deadline)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
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
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* İlerleme Detayı */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Proje İlerlemesi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>İlerleme</span>
                    <span className="text-2xl font-bold text-blue-600">%{Math.round(progress)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="bg-blue-600 h-4 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>

                  {project.projectType === "frontend" ? (
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{project.completedPages}</div>
                        <div className="text-sm text-muted-foreground">Tamamlanan</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-600">{project.totalPages}</div>
                        <div className="text-sm text-muted-foreground">Toplam Sayfa</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-3 bg-indigo-50 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-600">%{project.completionPercentage}</div>
                      <div className="text-sm text-muted-foreground">Tamamlanma Oranı</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ödeme Bilgileri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Toplam Tutar:</span>
                    <span className="font-bold text-lg">{formatCurrency(project.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ödenen:</span>
                    <span className="font-medium text-green-600">{formatCurrency(project.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kalan:</span>
                    <span
                      className={`font-medium ${project.totalAmount > project.paidAmount ? "text-red-600" : "text-green-600"}`}
                    >
                      {formatCurrency(project.totalAmount - project.paidAmount)}
                    </span>
                  </div>

                  <div className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Ödeme İlerlemesi</span>
                      <span className="text-sm text-muted-foreground">
                        %{project.totalAmount > 0 ? Math.round((project.paidAmount / project.totalAmount) * 100) : 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all"
                        style={{
                          width: `${project.totalAmount > 0 ? (project.paidAmount / project.totalAmount) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Başlangıç</p>
                  <p className="font-medium">{formatDate(project.startDate || "")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teslim Tarihi</p>
                  <p className="font-medium">{formatDate(project.deadline || "")}</p>
                </div>
                {daysRemaining !== null && (
                  <div>
                    <p className="text-sm text-muted-foreground">Kalan Süre</p>
                    <p
                      className={`font-medium ${
                        daysRemaining < 0 ? "text-red-600" : daysRemaining < 7 ? "text-yellow-600" : "text-green-600"
                      }`}
                    >
                      {daysRemaining < 0 ? `${Math.abs(daysRemaining)} gün gecikme` : `${daysRemaining} gün`}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Proje Notları */}
          {project.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Proje Notları</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{project.notes}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
