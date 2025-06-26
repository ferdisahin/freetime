"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Share2, Calendar, CreditCard, FileText } from "lucide-react"
import type { Project, Client } from "@/lib/types"
import {
  calculateProjectPrice,
  formatCurrency,
  formatDate,
  getStatusLabel,
  getStatusColor,
  getPaymentStatusLabel,
  getPaymentStatusColor,
  calculateDaysRemaining,
} from "@/lib/utils"

interface ProjectShareProps {
  project: Project
  client: Client
}

export function ProjectShare({ project, client }: ProjectShareProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = `${window.location.origin}/share/${project.shareToken}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Kopyalama hatası:", error)
    }
  }

  const totalPrice = calculateProjectPrice(project)
  const progress = project.totalPages > 0 ? (project.completedPages / project.totalPages) * 100 : 0
  const remainingAmount = project.totalAmount - project.paidAmount
  const daysRemaining = calculateDaysRemaining(project.deadline)

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
          <p className="text-xl text-muted-foreground">Proje Detayları ve İlerleme Raporu</p>
        </div>

        {/* Share URL */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Paylaşım Linki
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="flex-1" />
              <Button onClick={copyToClipboard} variant="outline">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Kopyalandı" : "Kopyala"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ana Bilgiler Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Proje Durumu */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Proje Durumu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge className={`${getStatusColor(project.status)} text-white text-lg px-4 py-2`}>
                  {getStatusLabel(project.status)}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Müşteri:</span>
                  <span className="font-medium">{client.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tip:</span>
                  <span>{client.type === "individual" ? "Bireysel" : "Kurumsal"}</span>
                </div>
                {client.company && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Şirket:</span>
                    <span>{client.company}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tarih Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Tarih Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Başlangıç:</span>
                  <span className="font-medium">{formatDate(project.startDate || "")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Teslim Tarihi:</span>
                  <span className="font-medium">{formatDate(project.deadline || "")}</span>
                </div>
                {daysRemaining !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kalan Süre:</span>
                    <span
                      className={`font-medium ${daysRemaining < 0 ? "text-red-600" : daysRemaining < 7 ? "text-yellow-600" : "text-green-600"}`}
                    >
                      {daysRemaining < 0 ? `${Math.abs(daysRemaining)} gün gecikme` : `${daysRemaining} gün`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Son Güncelleme:</span>
                  <span>{formatDate(project.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ödeme Durumu */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Ödeme Durumu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge className={`${getPaymentStatusColor(project.paymentStatus)} text-white text-lg px-4 py-2`}>
                  {getPaymentStatusLabel(project.paymentStatus)}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Toplam Tutar:</span>
                  <span className="font-bold text-lg">{formatCurrency(project.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alınan Ödeme:</span>
                  <span className="font-medium text-green-600">{formatCurrency(project.paidAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kalan Ödeme:</span>
                  <span className={`font-medium ${remainingAmount > 0 ? "text-red-600" : "text-green-600"}`}>
                    {formatCurrency(remainingAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* İlerleme Detayları */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sayfa İlerlemesi */}
          <Card>
            <CardHeader>
              <CardTitle>Sayfa İlerlemesi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">İlerleme</span>
                <span className="text-2xl font-bold text-blue-600">%{Math.round(progress)}</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

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
            </CardContent>
          </Card>

          {/* Fiyat Detayları */}
          <Card>
            <CardHeader>
              <CardTitle>Fiyat Detayları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <table className="w-full">
                  <tbody className="space-y-2">
                    <tr className="border-b">
                      <td className="py-2 text-muted-foreground">Sayfa Başı Ücret</td>
                      <td className="py-2 text-right">{formatCurrency(project.pricePerPage)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-muted-foreground">Tamamlanan Sayfa</td>
                      <td className="py-2 text-right">{project.completedPages} sayfa</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-muted-foreground">Sayfa Ücreti</td>
                      <td className="py-2 text-right font-medium">
                        {formatCurrency(project.completedPages * project.pricePerPage)}
                      </td>
                    </tr>

                    {project.extraHours > 0 && (
                      <>
                        <tr className="border-b">
                          <td className="py-2 text-muted-foreground">Ekstra Saat</td>
                          <td className="py-2 text-right">{project.extraHours} saat</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 text-muted-foreground">Saatlik Ücret</td>
                          <td className="py-2 text-right">{formatCurrency(project.extraHourRate)}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 text-muted-foreground">Ekstra Ücret</td>
                          <td className="py-2 text-right font-medium">
                            {formatCurrency(project.extraHours * project.extraHourRate)}
                          </td>
                        </tr>
                      </>
                    )}

                    <tr className="border-t-2 border-gray-300">
                      <td className="py-3 text-lg font-semibold">Toplam Tutar</td>
                      <td className="py-3 text-right text-lg font-bold text-green-600">{formatCurrency(totalPrice)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notlar */}
        {project.notes && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Proje Notları</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{project.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* İletişim Bilgileri */}
        {(client.email || client.phone) && (
          <Card>
            <CardHeader>
              <CardTitle>İletişim Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {client.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">E-posta:</span>
                    <a href={`mailto:${client.email}`} className="font-medium text-blue-600 hover:underline">
                      {client.email}
                    </a>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Telefon:</span>
                    <a href={`tel:${client.phone}`} className="font-medium text-blue-600 hover:underline">
                      {client.phone}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
