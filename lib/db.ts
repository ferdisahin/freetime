import Database from "better-sqlite3"
import path from "path"
import bcrypt from "bcryptjs"

// SQLite veritabanı bağlantısı
const dbPath = path.join(process.cwd(), "freelance.db")
export const db = new Database(dbPath)

// Veritabanını başlat
export function initializeDatabase() {
  try {
    // Users tablosu
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Settings tablosu - genişletildi
    db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Clients tablosu - share_token eklendi
    db.exec(`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('individual', 'corporate')),
        email TEXT,
        phone TEXT,
        company TEXT,
        notes TEXT,
        tags TEXT,
        share_token TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Projects tablosu - NULL değerlere izin ver
    db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        client_id INTEGER NOT NULL,
        project_type TEXT NOT NULL DEFAULT 'frontend' CHECK (project_type IN ('frontend', 'backend', 'fullstack')),
        status TEXT NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed', 'on-hold')),
        total_pages INTEGER,
        completed_pages INTEGER,
        price_per_page REAL,
        fixed_price REAL,
        completion_percentage INTEGER DEFAULT 0,
        extra_hours REAL NOT NULL DEFAULT 0,
        extra_hour_rate REAL NOT NULL DEFAULT 0,
        notes TEXT,
        share_token TEXT UNIQUE,
        total_amount REAL NOT NULL DEFAULT 0,
        paid_amount REAL NOT NULL DEFAULT 0,
        payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
        start_date DATE,
        deadline DATE,
        category TEXT,
        priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        estimated_hours REAL,
        actual_hours REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id)
      )
    `)

    // Time entries tablosu - zaman takibi
    db.exec(`
      CREATE TABLE IF NOT EXISTS time_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        hours REAL NOT NULL,
        date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
      )
    `)

    // Invoices tablosu - fatura sistemi
    db.exec(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        invoice_number TEXT UNIQUE NOT NULL,
        amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid')),
        due_date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id)
      )
    `)

    // Triggers
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_projects_updated_at
      AFTER UPDATE ON projects
      BEGIN
        UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `)

    db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_settings_updated_at
      AFTER UPDATE ON settings
      BEGIN
        UPDATE settings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `)

    // Mevcut tablolara yeni alanları ekle (migration)
    const migrations = [
      `ALTER TABLE projects ADD COLUMN project_type TEXT NOT NULL DEFAULT 'frontend'`,
      `ALTER TABLE projects ADD COLUMN fixed_price REAL`,
      `ALTER TABLE projects ADD COLUMN completion_percentage INTEGER DEFAULT 0`,
      `ALTER TABLE projects ADD COLUMN category TEXT`,
      `ALTER TABLE projects ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium'`,
      `ALTER TABLE projects ADD COLUMN estimated_hours REAL`,
      `ALTER TABLE projects ADD COLUMN actual_hours REAL DEFAULT 0`,
      `ALTER TABLE clients ADD COLUMN notes TEXT`,
      `ALTER TABLE clients ADD COLUMN tags TEXT`,
      `ALTER TABLE clients ADD COLUMN share_token TEXT UNIQUE`,
    ]

    for (const migration of migrations) {
      try {
        db.exec(migration)
      } catch (e) {
        // Column already exists or other non-critical error
      }
    }

    // Mevcut müşterilere share_token ekle
    try {
      const clientsWithoutToken = db.prepare("SELECT id FROM clients WHERE share_token IS NULL").all()
      const updateClientToken = db.prepare("UPDATE clients SET share_token = ? WHERE id = ?")

      for (const client of clientsWithoutToken) {
        const token = require("crypto").randomBytes(16).toString("hex")
        updateClientToken.run(token, client.id)
      }
    } catch (e) {
      // Ignore if already done
    }

    // Default settings - genişletildi
    const defaultSettings = [
      { key: "default_price_per_page", value: "0" },
      { key: "default_extra_hour_rate", value: "0" },
      { key: "default_fixed_price", value: "0" },
      { key: "company_name", value: "" },
      { key: "company_email", value: "" },
      { key: "company_phone", value: "" },
      { key: "company_address", value: "" },
      { key: "company_website", value: "" },
      { key: "tax_rate", value: "0" },
      { key: "currency", value: "TRY" },
      { key: "language", value: "tr" },
    ]

    const checkSetting = db.prepare("SELECT COUNT(*) as count FROM settings WHERE key = ?")
    const insertSetting = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)")

    for (const setting of defaultSettings) {
      const exists = checkSetting.get(setting.key) as { count: number }
      if (exists.count === 0) {
        insertSetting.run(setting.key, setting.value)
      }
    }

    console.log("✅ SQLite veritabanı hazır")
  } catch (error) {
    console.error("❌ Veritabanı başlatma hatası:", error)
  }
}

// İlk kurulum kontrolü
export function isSetupComplete(): boolean {
  try {
    const stmt = db.prepare("SELECT COUNT(*) as count FROM users")
    const result = stmt.get() as { count: number }
    return result.count > 0
  } catch (error) {
    return false
  }
}

// Admin kullanıcı oluştur
export async function createAdminUser(userData: {
  username: string
  email: string
  password: string
  fullName: string
}): Promise<void> {
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    const stmt = db.prepare(`
      INSERT INTO users (username, email, password, full_name, is_admin)
      VALUES (?, ?, ?, ?, 1)
    `)

    stmt.run(userData.username, userData.email, hashedPassword, userData.fullName)
  } catch (error) {
    console.error("Admin kullanıcı oluşturulamadı:", error)
    throw new Error("Admin kullanıcı oluşturulamadı")
  }
}

// Kullanıcı doğrulama
export async function authenticateUser(
  username: string,
  password: string,
): Promise<{ id: number; username: string; email: string; fullName: string } | null> {
  try {
    const stmt = db.prepare("SELECT * FROM users WHERE username = ? OR email = ?")
    const user = stmt.get(username, username) as any

    if (!user) return null

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return null

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
    }
  } catch (error) {
    console.error("Kullanıcı doğrulama hatası:", error)
    return null
  }
}

// Settings operations
export function getSettings(): Record<string, string> {
  try {
    const stmt = db.prepare("SELECT key, value FROM settings")
    const rows = stmt.all() as { key: string; value: string }[]

    const settings: Record<string, string> = {}
    for (const row of rows) {
      settings[row.key] = row.value
    }
    return settings
  } catch (error) {
    console.error("Ayarlar getirilemedi:", error)
    return {}
  }
}

export function updateSetting(key: string, value: string): void {
  try {
    const stmt = db.prepare("UPDATE settings SET value = ? WHERE key = ?")
    stmt.run(value, key)
  } catch (error) {
    console.error("Ayar güncellenemedi:", error)
    throw new Error("Ayar güncellenemedi")
  }
}

// Dashboard istatistikleri
export function getDashboardStats(): any {
  try {
    const totalProjects = db.prepare("SELECT COUNT(*) as count FROM projects").get() as { count: number }
    const activeProjects = db
      .prepare("SELECT COUNT(*) as count FROM projects WHERE status IN ('pending', 'in-progress')")
      .get() as { count: number }
    const completedProjects = db.prepare("SELECT COUNT(*) as count FROM projects WHERE status = 'completed'").get() as {
      count: number
    }

    const totalRevenue = db.prepare("SELECT COALESCE(SUM(paid_amount), 0) as total FROM projects").get() as {
      total: number
    }
    const pendingPayments = db
      .prepare(
        "SELECT COALESCE(SUM(total_amount - paid_amount), 0) as pending FROM projects WHERE payment_status != 'paid'",
      )
      .get() as { pending: number }

    // Bu ay geliri
    const thisMonthRevenue = db
      .prepare(`
      SELECT COALESCE(SUM(paid_amount), 0) as total 
      FROM projects 
      WHERE strftime('%Y-%m', updated_at) = strftime('%Y-%m', 'now')
    `)
      .get() as { total: number }

    return {
      totalProjects: totalProjects.count,
      activeProjects: activeProjects.count,
      completedProjects: completedProjects.count,
      totalRevenue: totalRevenue.total,
      pendingPayments: pendingPayments.pending,
      thisMonthRevenue: thisMonthRevenue.total,
    }
  } catch (error) {
    console.error("Dashboard istatistikleri getirilemedi:", error)
    return {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalRevenue: 0,
      pendingPayments: 0,
      thisMonthRevenue: 0,
    }
  }
}

// Veritabanı bağlantısını kapat
export function closeDatabase() {
  db.close()
}
