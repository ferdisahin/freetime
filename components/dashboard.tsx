"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Clock, CheckCircle, DollarSign, AlertCircle, BarChart3, Calendar, Users } from "lucide-react"
import type { DashboardStats, Project } from "@/lib/types"
import { formatCurrency, getStatusColor, getStatusLabel, calculateDaysRemaining } from "@/lib/utils"

interface DashboardProps {
  stats: DashboardStats
  onNavigate: (view: string) => void
}

export function Dashboard({ stats, onNavigate }: DashboardProps) {
  const [recentProjects, setRecentProjects] = useState<Project[]>([])

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
      title: "Toplam Gelir",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Bekleyen Ödemeler",
      value: formatCurrency(stats.pendingPayments),
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Bu Ay Gelir",
      value: formatCurrency(stats.thisMonthRevenue),
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Freelance projelerinizin genel görünümü</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onNavigate("projects")} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Projeler
          </Button>
          <Button onClick={() => onNavigate("clients")} variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Müşteriler
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button onClick={() => onNavigate("project-form")} className="h-20 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              Yeni Proje
            </Button>
            <Button onClick={() => onNavigate("client-form")} variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              Yeni Müşteri
            </Button>
            <Button onClick={() => onNavigate("settings")} variant="outline" className="h-20 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              Ayarlar
            </Button>
            <Button onClick={() => onNavigate("reports")} variant="outline" className="h-20 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              Raporlar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Projects Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Son Projeler</CardTitle>
          <Button variant="outline" size="sm" onClick={() => onNavigate("projects")}>
            Tümünü Gör
          </Button>
        </CardHeader>
        <CardContent>
          {stats.recentProjects && stats.recentProjects.length > 0 ? (
            <div className="space-y-4">
              {stats.recentProjects.slice(0, 5).map((project) => {
                const daysRemaining = calculateDaysRemaining(project.deadline)
                return (
                  <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusColor(project.status)} text-white`}>
                        {getStatusLabel(project.status)}
                      </Badge>
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">{project.category || "Kategori belirtilmemiş"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(project.totalAmount)}</p>
                      {daysRemaining !== null && (
                        <p
                          className={`text-sm ${daysRemaining < 0 ? "text-red-600" : daysRemaining < 7 ? "text-yellow-600" : "text-muted-foreground"}`}
                        >
                          {daysRemaining < 0 ? `${Math.abs(daysRemaining)} gün gecikme` : `${daysRemaining} gün kaldı`}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Henüz proje bulunmuyor</p>
              <Button onClick={() => onNavigate("project-form")}>İlk Projenizi Ekleyin</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
