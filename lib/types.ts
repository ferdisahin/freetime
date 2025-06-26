export type ClientType = "individual" | "corporate"
export type ProjectType = "frontend" | "backend" | "fullstack"

export type Client = {
  id: number
  name: string
  type: ClientType
  email?: string
  phone?: string
  company?: string
  notes?: string
  tags?: string[]
  shareToken?: string
  createdAt: string
}

export type ProjectStatus = "pending" | "in-progress" | "completed" | "on-hold"
export type PaymentStatus = "unpaid" | "partial" | "paid"

export type Project = {
  id: number
  name: string
  clientId: number
  projectType: ProjectType
  status: ProjectStatus
  // Frontend için
  totalPages?: number
  completedPages?: number
  pricePerPage?: number
  // Backend/Fullstack için
  fixedPrice?: number
  completionPercentage?: number
  // Ortak alanlar
  extraHours: number
  extraHourRate: number
  notes: string
  shareToken?: string
  totalAmount: number
  paidAmount: number
  paymentStatus: PaymentStatus
  startDate?: string
  deadline?: string
  category?: string
  priority: "low" | "medium" | "high"
  estimatedHours?: number
  actualHours?: number
  createdAt: string
  updatedAt: string
}

export type User = {
  id: number
  username: string
  email: string
  fullName: string
}

export type Settings = {
  defaultPricePerPage: number
  defaultExtraHourRate: number
  defaultFixedPrice: number
  companyName: string
  companyEmail: string
  companyPhone: string
  companyAddress?: string
  companyWebsite?: string
  taxRate?: number
  currency: string
  language: string
}

export type SetupFormData = {
  username: string
  email: string
  password: string
  confirmPassword: string
  fullName: string
}

export type LoginFormData = {
  username: string
  password: string
}

export type ProjectFormData = Omit<Project, "id" | "createdAt" | "updatedAt" | "shareToken">

export type ClientFormData = Omit<Client, "id" | "createdAt" | "shareToken">

export type TimeEntry = {
  id: number
  projectId: number
  description: string
  hours: number
  date: string
  createdAt: string
}

export type Invoice = {
  id: number
  projectId: number
  invoiceNumber: string
  amount: number
  status: "draft" | "sent" | "paid"
  dueDate: string
  createdAt: string
}

export type DashboardStats = {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalRevenue: number
  pendingPayments: number
  thisMonthRevenue: number
  projectsByStatus: Record<ProjectStatus, number>
  projectsByType: Record<ProjectType, number>
  recentProjects: Project[]
}

export type ClientDashboardStats = {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  projects: Project[]
}

// Database row types (snake_case)
export type ClientRow = {
  id: number
  name: string
  type: ClientType
  email?: string
  phone?: string
  company?: string
  notes?: string
  tags?: string
  share_token?: string
  created_at: string
}

export type ProjectRow = {
  id: number
  name: string
  client_id: number
  project_type: ProjectType
  status: ProjectStatus
  total_pages?: number
  completed_pages?: number
  price_per_page?: number
  fixed_price?: number
  completion_percentage?: number
  extra_hours: number
  extra_hour_rate: number
  notes: string
  share_token?: string
  total_amount: number
  paid_amount: number
  payment_status: PaymentStatus
  start_date?: string
  deadline?: string
  category?: string
  priority: "low" | "medium" | "high"
  estimated_hours?: number
  actual_hours?: number
  created_at: string
  updated_at: string
}
