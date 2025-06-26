"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save } from "lucide-react"
import { getSettingsAction, updateSettingsAction } from "@/actions/settings-actions"
import type { Settings } from "@/lib/types"

interface SettingsFormProps {
  onBack: () => void
}

export function SettingsForm({ onBack }: SettingsFormProps) {
  const [settings, setSettings] = useState<Settings>({
    defaultPricePerPage: 0,
    defaultExtraHourRate: 0,
    companyName: "",
    companyEmail: "",
    companyPhone: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const loadSettings = async () => {
      const result = await getSettingsAction()
      if (result.success) {
        setSettings(result.data)
      }
      setIsLoading(false)
    }

    loadSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage("")

    const result = await updateSettingsAction(settings)
    if (result.success) {
      setMessage("Ayarlar başarıyla kaydedildi")
    } else {
      setMessage(result.error || "Ayarlar kaydedilemedi")
    }

    setIsSaving(false)
  }

  const handleChange = (field: keyof Settings, value: string | number) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Ayarlar yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Geri Dön
        </Button>
        <h1 className="text-3xl font-bold">Ayarlar</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Varsayılan Proje Ayarları</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultPricePerPage">Varsayılan Sayfa Başı Ücret (₺)</Label>
                <Input
                  id="defaultPricePerPage"
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.defaultPricePerPage}
                  onChange={(e) => handleChange("defaultPricePerPage", Number.parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultExtraHourRate">Varsayılan Saatlik Ücret (₺)</Label>
                <Input
                  id="defaultExtraHourRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.defaultExtraHourRate}
                  onChange={(e) => handleChange("defaultExtraHourRate", Number.parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Şirket Bilgileri</h3>

              <div className="space-y-2">
                <Label htmlFor="companyName">Şirket Adı</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Şirket E-posta</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) => handleChange("companyEmail", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Şirket Telefon</Label>
                  <Input
                    id="companyPhone"
                    value={settings.companyPhone}
                    onChange={(e) => handleChange("companyPhone", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {message && (
              <Alert variant={message.includes("başarıyla") ? "default" : "destructive"}>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isSaving}>
              {isSaving && <Save className="mr-2 h-4 w-4 animate-spin" />}
              Ayarları Kaydet
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
