"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Trash2, Edit, Plus, Search, ArrowLeft, Share2, Copy, Check } from "lucide-react"
import type { Client } from "@/lib/types"
import { getClientTypeLabel } from "@/lib/utils"
import { Pagination } from "./pagination"

interface ClientTableProps {
  clients: Client[]
  onDelete: (id: number) => void
  onEdit: (client: Client) => void
  onAddNew: () => void
  onBack: () => void
}

const ITEMS_PER_PAGE = 10

export function ClientTable({ clients, onDelete, onEdit, onAddNew, onBack }: ClientTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [shareClient, setShareClient] = useState<Client | null>(null)
  const [copied, setCopied] = useState(false)

  // Filter clients
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedClients = filteredClients.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleShare = (client: Client) => {
    setShareClient(client)
  }

  const copyShareUrl = async () => {
    if (!shareClient?.shareToken) return

    const shareUrl = `${window.location.origin}/client/${shareClient.shareToken}`

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Kopyalama hatası:", error)
    }
  }

  const closeShareModal = () => {
    setShareClient(null)
    setCopied(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            Projelere Dön
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Müşteri Yönetimi</h1>
            <p className="text-muted-foreground">Toplam {filteredClients.length} müşteri</p>
          </div>
        </div>
        <Button onClick={onAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Yeni Müşteri
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Müşteri ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      {paginatedClients.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {clients.length === 0 ? "Henüz müşteri eklenmemiş" : "Arama kriterine uygun müşteri bulunamadı"}
            </p>
            {clients.length === 0 && <Button onClick={onAddNew}>İlk Müşterinizi Ekleyin</Button>}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Müşteri Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Müşteri Adı</th>
                    <th className="text-left p-3 font-medium">Tip</th>
                    <th className="text-left p-3 font-medium">İletişim</th>
                    <th className="text-left p-3 font-medium">Şirket</th>
                    <th className="text-left p-3 font-medium">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedClients.map((client) => (
                    <tr key={client.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <div className="font-medium">{client.name}</div>
                      </td>
                      <td className="p-3">
                        <Badge variant={client.type === "individual" ? "secondary" : "default"}>
                          {getClientTypeLabel(client.type)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          {client.email && <div>{client.email}</div>}
                          {client.phone && <div className="text-muted-foreground">{client.phone}</div>}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">{client.company || "-"}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(client)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Düzenle"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare(client)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Müşteri Portal'ını Paylaş"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(client.id)}
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

      {/* Share Modal */}
      {shareClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Müşteri Portal'ı Paylaş
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={closeShareModal}>
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">{shareClient.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Bu link ile müşteriniz tüm projelerini, ödeme durumlarını ve detayları görebilir. Link kalıcıdır ve
                  sürekli geçerlidir.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Müşteri Portal Linki:</label>
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}/client/${shareClient.shareToken}`}
                    readOnly
                    className="flex-1 text-sm"
                  />
                  <Button onClick={copyShareUrl} variant="outline" size="sm">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Kopyalandı" : "Kopyala"}
                  </Button>
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="text-green-600 mt-0.5">
                    <Share2 className="h-4 w-4" />
                  </div>
                  <div className="text-sm text-green-800">
                    <p className="font-medium">Müşteri Dashboard'u</p>
                    <p>Müşteriniz bu link ile:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Tüm projelerini görebilir</li>
                      <li>Ödeme durumlarını takip edebilir</li>
                      <li>Proje detaylarını inceleyebilir</li>
                      <li>İlerleme durumunu kontrol edebilir</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={closeShareModal}>
                  Kapat
                </Button>
                <Button
                  onClick={() => {
                    window.open(`/client/${shareClient.shareToken}`, "_blank")
                  }}
                >
                  Önizleme
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
