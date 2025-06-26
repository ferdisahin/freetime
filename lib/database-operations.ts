import { db } from "./db"
import type { Client, Project, ClientRow, ProjectRow, ClientFormData, ProjectFormData } from "./types"
import { randomBytes } from "crypto"

// Helper functions to convert between camelCase and snake_case
function rowToClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    email: row.email,
    phone: row.phone,
    company: row.company,
    notes: row.notes,
    tags: row.tags ? JSON.parse(row.tags) : [],
    shareToken: row.share_token,
    createdAt: row.created_at,
  }
}

function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    clientId: row.client_id,
    projectType: row.project_type,
    status: row.status,
    totalPages: row.total_pages,
    completedPages: row.completed_pages,
    pricePerPage: row.price_per_page,
    fixedPrice: row.fixed_price,
    completionPercentage: row.completion_percentage,
    extraHours: row.extra_hours,
    extraHourRate: row.extra_hour_rate,
    notes: row.notes,
    shareToken: row.share_token,
    totalAmount: row.total_amount,
    paidAmount: row.paid_amount,
    paymentStatus: row.payment_status,
    startDate: row.start_date,
    deadline: row.deadline,
    category: row.category,
    priority: row.priority,
    estimatedHours: row.estimated_hours,
    actualHours: row.actual_hours,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Client operations
export function getAllClients(): Client[] {
  try {
    const stmt = db.prepare("SELECT * FROM clients ORDER BY created_at DESC")
    const rows = stmt.all() as ClientRow[]
    return rows.map(rowToClient)
  } catch (error) {
    console.error("Müşteriler getirilemedi:", error)
    return []
  }
}

export function getClientByShareToken(token: string): Client | null {
  try {
    const stmt = db.prepare("SELECT * FROM clients WHERE share_token = ?")
    const row = stmt.get(token) as ClientRow | undefined
    return row ? rowToClient(row) : null
  } catch (error) {
    console.error("Müşteri getirilemedi:", error)
    return null
  }
}

export function getProjectsByClientId(clientId: number): Project[] {
  try {
    const stmt = db.prepare("SELECT * FROM projects WHERE client_id = ? ORDER BY created_at DESC")
    const rows = stmt.all(clientId) as ProjectRow[]
    return rows.map(rowToProject)
  } catch (error) {
    console.error("Müşteri projeleri getirilemedi:", error)
    return []
  }
}

export function createClient(data: ClientFormData): Client {
  try {
    const shareToken = randomBytes(16).toString("hex")

    const stmt = db.prepare(`
      INSERT INTO clients (name, type, email, phone, company, notes, tags, share_token)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      data.name,
      data.type,
      data.email,
      data.phone,
      data.company,
      data.notes,
      JSON.stringify(data.tags || []),
      shareToken,
    )

    const getStmt = db.prepare("SELECT * FROM clients WHERE id = ?")
    const row = getStmt.get(result.lastInsertRowid) as ClientRow

    return rowToClient(row)
  } catch (error) {
    console.error("Müşteri oluşturulamadı:", error)
    throw new Error("Müşteri oluşturulamadı")
  }
}

export function updateClient(id: number, data: Partial<ClientFormData>): void {
  try {
    const fields = []
    const values = []

    if (data.name !== undefined) {
      fields.push("name = ?")
      values.push(data.name)
    }
    if (data.type !== undefined) {
      fields.push("type = ?")
      values.push(data.type)
    }
    if (data.email !== undefined) {
      fields.push("email = ?")
      values.push(data.email)
    }
    if (data.phone !== undefined) {
      fields.push("phone = ?")
      values.push(data.phone)
    }
    if (data.company !== undefined) {
      fields.push("company = ?")
      values.push(data.company)
    }
    if (data.notes !== undefined) {
      fields.push("notes = ?")
      values.push(data.notes)
    }
    if (data.tags !== undefined) {
      fields.push("tags = ?")
      values.push(JSON.stringify(data.tags))
    }

    if (fields.length === 0) return

    values.push(id)
    const stmt = db.prepare(`UPDATE clients SET ${fields.join(", ")} WHERE id = ?`)
    stmt.run(...values)
  } catch (error) {
    console.error("Müşteri güncellenemedi:", error)
    throw new Error("Müşteri güncellenemedi")
  }
}

export function deleteClient(id: number): void {
  try {
    // Check if client has projects
    const projectCheck = db.prepare("SELECT COUNT(*) as count FROM projects WHERE client_id = ?")
    const result = projectCheck.get(id) as { count: number }

    if (result.count > 0) {
      throw new Error("Bu müşteriye ait projeler bulunduğu için silinemez")
    }

    const stmt = db.prepare("DELETE FROM clients WHERE id = ?")
    stmt.run(id)
  } catch (error) {
    console.error("Müşteri silinemedi:", error)
    throw error
  }
}

// Project operations
export function getAllProjects(): Project[] {
  try {
    const stmt = db.prepare("SELECT * FROM projects ORDER BY created_at DESC")
    const rows = stmt.all() as ProjectRow[]
    return rows.map(rowToProject)
  } catch (error) {
    console.error("Projeler getirilemedi:", error)
    return []
  }
}

export function getProjectByShareToken(token: string): Project | null {
  try {
    const stmt = db.prepare("SELECT * FROM projects WHERE share_token = ?")
    const row = stmt.get(token) as ProjectRow | undefined
    return row ? rowToProject(row) : null
  } catch (error) {
    console.error("Proje getirilemedi:", error)
    return null
  }
}

export function createProject(data: ProjectFormData): Project {
  try {
    // Token'ı sadece proje oluşturulurken bir kere oluştur
    const shareToken = randomBytes(16).toString("hex")

    const stmt = db.prepare(`
      INSERT INTO projects (
        name, client_id, project_type, status, total_pages, completed_pages, price_per_page, 
        fixed_price, completion_percentage, extra_hours, extra_hour_rate, notes, share_token, 
        total_amount, paid_amount, payment_status, start_date, deadline, category, priority, 
        estimated_hours, actual_hours
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      data.name,
      data.clientId,
      data.projectType,
      data.status,
      data.totalPages || null,
      data.completedPages || null,
      data.pricePerPage || null,
      data.fixedPrice || null,
      data.completionPercentage || null,
      data.extraHours,
      data.extraHourRate,
      data.notes,
      shareToken,
      data.totalAmount,
      data.paidAmount,
      data.paymentStatus,
      data.startDate || null,
      data.deadline || null,
      data.category || null,
      data.priority,
      data.estimatedHours || null,
      data.actualHours || null,
    )

    const getStmt = db.prepare("SELECT * FROM projects WHERE id = ?")
    const row = getStmt.get(result.lastInsertRowid) as ProjectRow

    return rowToProject(row)
  } catch (error) {
    console.error("Proje oluşturulamadı:", error)
    throw new Error("Proje oluşturulamadı")
  }
}

export function updateProject(id: number, data: Partial<ProjectFormData>): void {
  try {
    const fields = []
    const values = []

    if (data.name !== undefined) {
      fields.push("name = ?")
      values.push(data.name)
    }
    if (data.clientId !== undefined) {
      fields.push("client_id = ?")
      values.push(data.clientId)
    }
    if (data.projectType !== undefined) {
      fields.push("project_type = ?")
      values.push(data.projectType)
    }
    if (data.status !== undefined) {
      fields.push("status = ?")
      values.push(data.status)
    }
    if (data.totalPages !== undefined) {
      fields.push("total_pages = ?")
      values.push(data.totalPages || null)
    }
    if (data.completedPages !== undefined) {
      fields.push("completed_pages = ?")
      values.push(data.completedPages || null)
    }
    if (data.pricePerPage !== undefined) {
      fields.push("price_per_page = ?")
      values.push(data.pricePerPage || null)
    }
    if (data.fixedPrice !== undefined) {
      fields.push("fixed_price = ?")
      values.push(data.fixedPrice || null)
    }
    if (data.completionPercentage !== undefined) {
      fields.push("completion_percentage = ?")
      values.push(data.completionPercentage || null)
    }
    if (data.extraHours !== undefined) {
      fields.push("extra_hours = ?")
      values.push(data.extraHours)
    }
    if (data.extraHourRate !== undefined) {
      fields.push("extra_hour_rate = ?")
      values.push(data.extraHourRate)
    }
    if (data.notes !== undefined) {
      fields.push("notes = ?")
      values.push(data.notes)
    }
    if (data.totalAmount !== undefined) {
      fields.push("total_amount = ?")
      values.push(data.totalAmount)
    }
    if (data.paidAmount !== undefined) {
      fields.push("paid_amount = ?")
      values.push(data.paidAmount)
    }
    if (data.paymentStatus !== undefined) {
      fields.push("payment_status = ?")
      values.push(data.paymentStatus)
    }
    if (data.startDate !== undefined) {
      fields.push("start_date = ?")
      values.push(data.startDate || null)
    }
    if (data.deadline !== undefined) {
      fields.push("deadline = ?")
      values.push(data.deadline || null)
    }
    if (data.category !== undefined) {
      fields.push("category = ?")
      values.push(data.category || null)
    }
    if (data.priority !== undefined) {
      fields.push("priority = ?")
      values.push(data.priority)
    }
    if (data.estimatedHours !== undefined) {
      fields.push("estimated_hours = ?")
      values.push(data.estimatedHours || null)
    }
    if (data.actualHours !== undefined) {
      fields.push("actual_hours = ?")
      values.push(data.actualHours || null)
    }

    if (fields.length === 0) return

    values.push(id)
    const stmt = db.prepare(`UPDATE projects SET ${fields.join(", ")} WHERE id = ?`)
    stmt.run(...values)
  } catch (error) {
    console.error("Proje güncellenemedi:", error)
    throw new Error("Proje güncellenemedi")
  }
}

export function deleteProject(id: number): void {
  try {
    const stmt = db.prepare("DELETE FROM projects WHERE id = ?")
    stmt.run(id)
  } catch (error) {
    console.error("Proje silinemedi:", error)
    throw new Error("Proje silinemedi")
  }
}

// Token yenileme fonksiyonu (isteğe bağlı - manuel olarak kullanılabilir)
export function regenerateShareToken(projectId: number): string {
  try {
    const newToken = randomBytes(16).toString("hex")
    const stmt = db.prepare("UPDATE projects SET share_token = ? WHERE id = ?")
    stmt.run(newToken, projectId)
    return newToken
  } catch (error) {
    console.error("Token yenilenemedi:", error)
    throw new Error("Token yenilenemedi")
  }
}

export function regenerateClientShareToken(clientId: number): string {
  try {
    const newToken = randomBytes(16).toString("hex")
    const stmt = db.prepare("UPDATE clients SET share_token = ? WHERE id = ?")
    stmt.run(newToken, clientId)
    return newToken
  } catch (error) {
    console.error("Müşteri token yenilenemedi:", error)
    throw new Error("Müşteri token yenilenemedi")
  }
}
