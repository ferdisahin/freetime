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
import type { ProjectFormData, ProjectStatus, PaymentStatus, ProjectType, Client, Settings } from "@/lib/types"
import { getStatusLabel, getPaymentStatusLabel, getProjectTypeLabel, getPriorityLabel } from "@/lib/utils"
import { getSettingsAction } from "@/actions/settings-actions"

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => void
  onCancel: () => void
  clients: Client[]
  initialData?: ProjectFormData
  isEditing?: boolean
}

export function ProjectForm({ onSubmit, onCancel, clients, initialData, isEditing = false }: ProjectFormProps) {
  const [settings, setSettings] = useState<Settings | null>(null)
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
  const projectTypeOptions: ProjectType[] = ["frontend", "backend", "fullstack"]
  const priorityOptions: ("low" | "medium" | "high")[] = ["low", "medium", "high"]

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? "Projeyi Düzenle" : "Yeni Proje Ekle"}
          {formData.projectType && <Badge variant="outline">{getProjectTypeLabel(formData.projectType)}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Temel Bilgiler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="name">Proje Adı</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
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
              <Label htmlFor="projectType">Proje Tipi</Label>
              <Select
                value={formData.projectType}
                onValueChange={(value: ProjectType) => handleChange("projectType", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getProjectTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Proje Durumu</Label>
              <Select value={formData.status} onValueChange={(value: ProjectStatus) => handleChange("status", value)}>
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

            <div>
              <Label htmlFor="category">Kategori</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                placeholder="Web Sitesi, E-ticaret, vb."
              />
            </div>
          </div>

          {/* Tarih Bilgileri */}
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
          </div>

          {/* Proje Tipi Bazlı Fiyatlandırma */}
          {formData.projectType === "frontend" ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Frontend Proje - Sayfa Bazlı Fiyatlandırma</h3>
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
              <h3 className="text-lg font-medium border-b pb-2">
                {getProjectTypeLabel(formData.projectType)} Proje - Sabit Fiyat
              </h3>
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

          {/* Zaman Takibi */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Zaman Takibi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimatedHours">Tahmini Süre (Saat)</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimatedHours || 0}
                  onChange={(e) => handleChange("estimatedHours", Number.parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label htmlFor="actualHours">Gerçek Süre (Saat)</Label>
                <Input
                  id="actualHours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.actualHours || 0}
                  onChange={(e) => handleChange("actualHours", Number.parseFloat(e.target.value) || 0)}
                  readOnly={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
            </div>
          </div>

          {/* Ekstra Saat Bilgileri */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Ekstra Çalışma</h3>
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

          {/* Ödeme Bilgileri */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Ödeme Bilgileri</h3>
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
                  className="bg-muted"
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
          </div>

          <div>
            <Label htmlFor="notes">Notlar</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
              placeholder="Proje hakkında notlar, özel istekler, vb."
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              İptal
            </Button>
            <Button type="submit">{isEditing ? "Güncelle" : "Proje Ekle"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
