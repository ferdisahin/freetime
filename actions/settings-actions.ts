"use server"

import { getSettings, updateSetting } from "@/lib/db"
import type { Settings } from "@/lib/types"

export async function getSettingsAction() {
  try {
    const rawSettings = getSettings()

    const settings: Settings = {
      defaultPricePerPage: Number.parseFloat(rawSettings.default_price_per_page) || 0,
      defaultExtraHourRate: Number.parseFloat(rawSettings.default_extra_hour_rate) || 0,
      defaultFixedPrice: Number.parseFloat(rawSettings.default_fixed_price) || 0,
      companyName: rawSettings.company_name || "",
      companyEmail: rawSettings.company_email || "",
      companyPhone: rawSettings.company_phone || "",
      companyAddress: rawSettings.company_address || "",
      companyWebsite: rawSettings.company_website || "",
      taxRate: Number.parseFloat(rawSettings.tax_rate) || 0,
      currency: rawSettings.currency || "TRY",
      language: rawSettings.language || "tr",
    }

    return { success: true, data: settings }
  } catch (error) {
    return { success: false, error: "Ayarlar getirilemedi" }
  }
}

export async function updateSettingsAction(settings: Settings) {
  try {
    updateSetting("default_price_per_page", settings.defaultPricePerPage.toString())
    updateSetting("default_extra_hour_rate", settings.defaultExtraHourRate.toString())
    updateSetting("default_fixed_price", settings.defaultFixedPrice.toString())
    updateSetting("company_name", settings.companyName)
    updateSetting("company_email", settings.companyEmail)
    updateSetting("company_phone", settings.companyPhone)
    updateSetting("company_address", settings.companyAddress || "")
    updateSetting("company_website", settings.companyWebsite || "")
    updateSetting("tax_rate", (settings.taxRate || 0).toString())
    updateSetting("currency", settings.currency)
    updateSetting("language", settings.language)

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Ayarlar güncellenemedi" }
  }
}
