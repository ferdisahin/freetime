"use server"

import { revalidatePath } from "next/cache"
import { getAllProjects, createProject, updateProject, deleteProject } from "@/lib/database-operations"
import type { ProjectFormData } from "@/lib/types"

export async function getProjectsAction() {
  try {
    return { success: true, data: getAllProjects() }
  } catch (error) {
    return { success: false, error: "Projeler getirilemedi" }
  }
}

export async function createProjectAction(data: ProjectFormData) {
  try {
    const project = createProject(data)
    revalidatePath("/")
    return { success: true, data: project }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Proje oluşturulamadı" }
  }
}

export async function updateProjectAction(id: number, data: Partial<ProjectFormData>) {
  try {
    updateProject(id, data)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Proje güncellenemedi" }
  }
}

export async function deleteProjectAction(id: number) {
  try {
    deleteProject(id)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Proje silinemedi" }
  }
}
