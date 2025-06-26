import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Project, ProjectStatus, PaymentStatus, ProjectType } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateProjectPrice(project: Project): number {
  let basePrice = 0

  if (project.projectType === "frontend") {
    basePrice = (project.completedPages || 0) * (project.pricePerPage || 0)
  } else {
    // Backend/Fullstack için sabit fiyat
    const completionRate = (project.completionPercentage || 0) / 100
    basePrice = (project.fixedPrice || 0) * completionRate
  }

  const extraHourPrice = project.extraHours * project.extraHourRate
  return basePrice + extraHourPrice
}

export function formatCurrency(amount: number, currency = "TRY"): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString("tr-TR")
}

export function getStatusLabel(status: ProjectStatus): string {
  const labels = {
    pending: "Beklemede",
    "in-progress": "Devam Ediyor",
    completed: "Tamamlandı",
    "on-hold": "Askıda",
  }
  return labels[status]
}

export function getStatusColor(status: ProjectStatus): string {
  const colors = {
    pending: "bg-yellow-500",
    "in-progress": "bg-blue-500",
    completed: "bg-green-500",
    "on-hold": "bg-gray-500",
  }
  return colors[status]
}

export function getProjectTypeLabel(type: ProjectType): string {
  const labels = {
    frontend: "Frontend",
    backend: "Backend",
    fullstack: "Full-Stack",
  }
  return labels[type]
}

export function getProjectTypeColor(type: ProjectType): string {
  const colors = {
    frontend: "bg-purple-500",
    backend: "bg-orange-500",
    fullstack: "bg-indigo-500",
  }
  return colors[type]
}

export function getPriorityLabel(priority: "low" | "medium" | "high"): string {
  const labels = {
    low: "Düşük",
    medium: "Orta",
    high: "Yüksek",
  }
  return labels[priority]
}

export function getPriorityColor(priority: "low" | "medium" | "high"): string {
  const colors = {
    low: "bg-green-500",
    medium: "bg-yellow-500",
    high: "bg-red-500",
  }
  return colors[priority]
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  const labels = {
    unpaid: "Ödenmedi",
    partial: "Kısmi Ödendi",
    paid: "Ödendi",
  }
  return labels[status]
}

export function getPaymentStatusColor(status: PaymentStatus): string {
  const colors = {
    unpaid: "bg-red-500",
    partial: "bg-yellow-500",
    paid: "bg-green-500",
  }
  return colors[status]
}

export function getClientTypeLabel(type: "individual" | "corporate"): string {
  return type === "individual" ? "Bireysel" : "Kurumsal"
}

export function calculateDaysRemaining(deadline?: string): number | null {
  if (!deadline) return null

  const today = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

export function calculateProgress(project: Project): number {
  if (project.projectType === "frontend") {
    return project.totalPages && project.totalPages > 0 ? ((project.completedPages || 0) / project.totalPages) * 100 : 0
  } else {
    return project.completionPercentage || 0
  }
}

export function generateInvoiceNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const timestamp = Date.now().toString().slice(-4)
  return `INV-${year}${month}-${timestamp}`
}
