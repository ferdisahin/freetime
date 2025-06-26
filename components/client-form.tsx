"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ClientFormData, ClientType } from "@/lib/types"

interface ClientFormProps {
  onSubmit: (data: ClientFormData) => void
  onCancel: () => void
  initialData?: ClientFormData
  isEditing?: boolean
}

export function ClientForm({ onSubmit, onCancel, initialData, isEditing = false }: ClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>(
    initialData || {
      name: "",
      type: "individual",
      email: "",
      phone: "",
      company: "",
    },
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field: keyof ClientFormData, value: string | ClientType) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Müşteriyi Düzenle" : "Yeni Müşteri Ekle"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Müşteri Adı</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
            </div>

            <div>
              <Label htmlFor="type">Müşteri Tipi</Label>
              <Select value={formData.type} onValueChange={(value: ClientType) => handleChange("type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Bireysel</SelectItem>
                  <SelectItem value="corporate">Kurumsal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
            </div>

            {formData.type === "corporate" && (
              <div className="md:col-span-2">
                <Label htmlFor="company">Şirket Adı</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              İptal
            </Button>
            <Button type="submit">{isEditing ? "Güncelle" : "Müşteri Ekle"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
