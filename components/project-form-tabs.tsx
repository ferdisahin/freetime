"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectTypeModal } from "./project-type-modal"
import type { ProjectFormData, ProjectStatus, PaymentStatus, ProjectType, Client, Settings } from "@/lib/types"
import {
  getStatusLabel,
  getPaymentStatusLabel,
  getProjectTypeLabel,
  getPriorityLabel,
  getProjectTypeColor,
} from "@/lib/utils"
import { getSettingsAction } from "@/actions/settings-actions"
import { FileText, DollarSign, CreditCard, StickyNote, Calendar } from "lucide-react"

interface ProjectFormTabsProps {
  onSubmit: (data: ProjectFormData) => void
  onCancel: () => void
  clients: Client[]
  initialData?: ProjectFormData
  isEditing?: boolean
}

export function ProjectFormTabs({ onSubmit, onCancel, clients, initialData, isEditing = false }: ProjectFormTabsProps) {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [showTypeModal, setShowTypeModal] = useState(!isEditing && !initialData)
  const [activeTab, setActiveTab] = useState("info")
  const [formData, setFormData] = useState<ProjectFormData>(
    initialData || {
      name: "",
      clientId: 0,
      projectType: "frontend",
      status: "pending",
      totalPages: 0,
      completedPages: 0,
      pricePerPage: 0,
      fixedPrice: 0,
      completionPercentage: 0,
      extraHours: 0,
      extraHourRate: 0,
      notes: "",
      totalAmount: 0,
      paidAmount: 0,
      paymentStatus: "unpaid",
      startDate: "",
      deadline: "",
      category: "",
      priority: "medium",
      estimatedHours: 0,
      actualHours: 0,
    },
  )

  useEffect(() => {
    const loadSettings = async () => {
      const result = await getSettingsAction()
      if (result.success) {
        setSettings(result.data)

        // Apply default values only for new projects
        if (!isEditing && !initialData) {
          setFormData((prev) => ({
            ...prev,
            pricePerPage: result.data.defaultPricePerPage,
            extraHourRate: result.data.defaultExtraHourRate,
            fixedPrice: result.data.defaultFixedPrice,
          }))
        }
      }
    }

    loadSettings()
  }, [isEditing, initialData])

  // Calculate total amount automatically
  useEffect(() => {
    let baseAmount = 0

    if (formData.projectType === "frontend") {
      baseAmount = (formData.completedPages || 0) * (formData.pricePerPage || 0)
    } else {
      // Backend/Fullstack için sabit fiyat
      const completionRate = (formData.completionPercentage || 0) / 100
      baseAmount = (formData.fixedPrice || 0) * completionRate
    }

    const extraAmount = formData.extraHours * formData.extraHourRate
    const calculatedTotal = baseAmount + extraAmount

    setFormData((prev) => ({
      ...prev,
      totalAmount: calculatedTotal,
    }))
  }, [
    formData.projectType,
    formData.completedPages,
    formData.pricePerPage,
    formData.fixedPrice,
    formData.completionPercentage,
    formData.extraHours,
    formData.extraHourRate,
  ])

  // Update payment status based on paid amount
  useEffect(() => {
    let newPaymentStatus: PaymentStatus = "unpaid"

    if (formData.paidAmount > 0) {
      if (formData.paidAmount >= formData.totalAmount) {
        newPaymentStatus = "paid"
      } else {
        newPaymentStatus = "partial"
      }
    }

    setFormData((prev) => ({
      ...prev,
      paymentStatus: newPaymentStatus,
    }))
  }, [formData.paidAmount, formData.totalAmount])

  const handleProjectTypeSelect = (type: ProjectType) => {
    setFormData((prev) => ({
      ...prev,
      projectType: type,
      // Reset type-specific fields
      totalPages: type === "frontend" ? prev.totalPages : undefined,
      completedPages: type === "frontend" ? prev.completedPages : undefined,
      pricePerPage: type === "frontend" ? prev.pricePerPage : undefined,
      fixedPrice: type !== "frontend" ? settings?.defaultFixedPrice || 0 : undefined,
      completionPercentage: type !== "frontend" ? 0 : undefined,
    }))
    setShowTypeModal(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.clientId === 0) {
      alert("Lütfen bir müşteri seçin")
      return
    }
    onSubmit(formData)
  }

  const handleChange = (
    field: keyof ProjectFormData,
    value: string | number | ProjectStatus | PaymentStatus | ProjectType,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const statusOptions: ProjectStatus[] = ["pending", "in-progress", "completed", "on-hold"]
  const priorityOptions: ("low" | "medium" | "high")[] = ["low", "medium", "high"]

  const tabsConfig = [
    { id: "info", label: "Proje Bilgileri", icon: FileText },
    { id: "pricing", label: "Fiyatlandırma", icon: DollarSign },
    { id: "payment", label: "Ödeme Bilgileri", icon: CreditCard },
    { id: "schedule", label: "Tarih & Süre", icon: Calendar },
    { id: "notes", label: "Notlar & Ayarlar", icon: StickyNote },
  ]

  return (
    <>
      <ProjectTypeModal
        isOpen={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        onSelect={handleProjectTypeSelect}
      />

      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>{isEditing ? "Projeyi Düzenle" : "Yeni Proje Ekle"}</CardTitle>
              <Badge className={`${getProjectTypeColor(formData.projectType)} text-white`}>
                {getProjectTypeLabel(formData.projectType)}
              </Badge>
            </div>
            {!showTypeModal && (
              <Button variant="outline" size="sm" onClick={() => setShowTypeModal(true)}>
                Proje Tipini Değiştir
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                {tabsConfig.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {/* Proje Bilgileri */}
              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Proje Adı</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                      placeholder="Örn: E-ticaret Web Sitesi"
                    />
                  </div>

                  <div>
                    <Label htmlFor="client">Müşteri</Label>
                    <Select
                      value={formData.clientId.toString()}
                      onValueChange={(value) => handleChange("clientId", Number.parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Müşteri seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name} ({client.type === "individual" ? "Bireysel" : "Kurumsal"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Proje Durumu</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: ProjectStatus) => handleChange("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {getStatusLabel(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Öncelik</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: "low" | "medium" | "high") => handleChange("priority", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {getPriorityLabel(priority)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="category">Kategori</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                      placeholder="Örn: Web Sitesi, E-ticaret, Mobil Uygulama"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Fiyatlandırma */}
              <TabsContent value="pricing" className="space-y-4">
                {formData.projectType === "frontend" ? (
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h3 className="text-lg font-medium text-purple-800 mb-2">
                        Frontend Proje - Sayfa Bazlı Fiyatlandırma
                      </h3>
                      <p className="text-sm text-purple-600">Her sayfa için ayrı ücret belirlenir</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="totalPages">Toplam Sayfa Sayısı</Label>
                        <Input
                          id="totalPages"
                          type="number"
                          min="0"
                          value={formData.totalPages || 0}
                          onChange={(e) => handleChange("totalPages", Number.parseInt(e.target.value) || 0)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="completedPages">Tamamlanan Sayfa</Label>
                        <Input
                          id="completedPages"
                          type="number"
                          min="0"
                          max={formData.totalPages || 0}
                          value={formData.completedPages || 0}
                          onChange={(e) => handleChange("completedPages", Number.parseInt(e.target.value) || 0)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="pricePerPage">
                          Sayfa Başı Ücret (₺)
                          {settings && settings.defaultPricePerPage > 0 && !isEditing && (
                            <span className="text-sm text-muted-foreground ml-2">
                              (Varsayılan: {settings.defaultPricePerPage}₺)
                            </span>
                          )}
                        </Label>
                        <Input
                          id="pricePerPage"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.pricePerPage || 0}
                          onChange={(e) => handleChange("pricePerPage", Number.parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                      <h3 className="text-lg font-medium text-indigo-800 mb-2">
                        {getProjectTypeLabel(formData.projectType)} Proje - Sabit Fiyat
                      </h3>
                      <p className="text-sm text-indigo-600">Proje için toplam sabit bir ücret belirlenir</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fixedPrice">
                          Proje Bedeli (₺)
                          {settings && settings.defaultFixedPrice > 0 && !isEditing && (
                            <span className="text-sm text-muted-foreground ml-2">
                              (Varsayılan: {settings.defaultFixedPrice}₺)
                            </span>
                          )}
                        </Label>
                        <Input
                          id="fixedPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.fixedPrice || 0}
                          onChange={(e) => handleChange("fixedPrice", Number.parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="completionPercentage">Tamamlanma Yüzdesi (%)</Label>
                        <Input
                          id="completionPercentage"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.completionPercentage || 0}
                          onChange={(e) => handleChange("completionPercentage", Number.parseInt(e.target.value) || 0)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Ekstra Saat Bilgileri */}
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg font-medium">Ekstra Çalışma</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="extraHours">Ekstra Saat</Label>
                      <Input
                        id="extraHours"
                        type="number"
                        min="0"
                        step="0.5"
                        value={formData.extraHours}
                        onChange={(e) => handleChange("extraHours", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="extraHourRate">
                        Ekstra Saat Ücreti (₺)
                        {settings && settings.defaultExtraHourRate > 0 && !isEditing && (
                          <span className="text-sm text-muted-foreground ml-2">
                            (Varsayılan: {settings.defaultExtraHourRate}₺)
                          </span>
                        )}
                      </Label>
                      <Input
                        id="extraHourRate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.extraHourRate}
                        onChange={(e) => handleChange("extraHourRate", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Ödeme Bilgileri */}
              <TabsContent value="payment" className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-lg font-medium text-green-800 mb-2">Ödeme Takibi</h3>
                  <p className="text-sm text-green-600">Proje ödemelerini takip edin</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="totalAmount">Toplam Tutar (₺)</Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.totalAmount}
                      readOnly
                      className="bg-muted font-bold text-lg"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Otomatik hesaplanır</p>
                  </div>

                  <div>
                    <Label htmlFor="paidAmount">Alınan Ödeme (₺)</Label>
                    <Input
                      id="paidAmount"
                      type="number"
                      min="0"
                      max={formData.totalAmount}
                      step="0.01"
                      value={formData.paidAmount}
                      onChange={(e) => handleChange("paidAmount", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="paymentStatus">Ödeme Durumu</Label>
                    <Input
                      id="paymentStatus"
                      value={getPaymentStatusLabel(formData.paymentStatus)}
                      readOnly
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Kalan: {(formData.totalAmount - formData.paidAmount).toFixed(2)}₺
                    </p>
                  </div>
                </div>

                {/* Ödeme Durumu Göstergesi */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Ödeme İlerlemesi</span>
                    <span className="text-sm text-muted-foreground">
                      %{formData.totalAmount > 0 ? Math.round((formData.paidAmount / formData.totalAmount) * 100) : 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all"
                      style={{
                        width: `${formData.totalAmount > 0 ? (formData.paidAmount / formData.totalAmount) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tarih & Süre */}
              <TabsContent value="schedule" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleChange("startDate", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="deadline">Teslim Tarihi</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => handleChange("deadline", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="actualHours">Harcanan Süre (Saat)</Label>
                    <Input
                      id="actualHours"
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.actualHours || 0}
                      onChange={(e) => handleChange("actualHours", Number.parseFloat(e.target.value) || 0)}
                      placeholder="WakaTime'dan alınan süre"
                    />
                    <p className="text-xs text-muted-foreground mt-1">WakaTime veya manuel olarak girin</p>
                  </div>
                </div>
              </TabsContent>

              {/* Notlar & Ayarlar */}
              <TabsContent value="notes" className="space-y-4">
                <div>
                  <Label htmlFor="notes">Proje Notları</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    rows={6}
                    placeholder="Proje hakkında notlar, özel istekler, teknik detaylar, müşteri talepleri vb."
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 justify-between pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                İptal
              </Button>
              <div className="flex gap-2">
                {activeTab !== "info" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const currentIndex = tabsConfig.findIndex((tab) => tab.id === activeTab)
                      if (currentIndex > 0) {
                        setActiveTab(tabsConfig[currentIndex - 1].id)
                      }
                    }}
                  >
                    Önceki
                  </Button>
                )}
                {activeTab !== "notes" ? (
                  <Button
                    type="button"
                    onClick={() => {
                      const currentIndex = tabsConfig.findIndex((tab) => tab.id === activeTab)
                      if (currentIndex < tabsConfig.length - 1) {
                        setActiveTab(tabsConfig[currentIndex + 1].id)
                      }
                    }}
                  >
                    Sonraki
                  </Button>
                ) : (
                  <Button type="submit">{isEditing ? "Güncelle" : "Proje Ekle"}</Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
