// ============================================================================
// RailDrishti Platform - Administration Service Layer
// Prepared for production backend connection with strict error/offline handling
// ============================================================================

import type {
  AdminSettings,
  AdminUser,
  AlertRule,
  AuditLog,
  Integration,
  ModelConfiguration,
  WeatherConfiguration,
} from "../types/admin"

const ADMIN_API_BASE = "http://localhost:5000/api/admin"

export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: string
  isBackendConnected: boolean
}

async function requestBackend<T>(endpoint: string, options?: RequestInit): Promise<ServiceResult<T>> {
  try {
    const res = await fetch(`${ADMIN_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })
    if (!res.ok) {
      return {
        success: false,
        error: `Server responded with status ${res.status}: ${res.statusText}`,
        isBackendConnected: true,
      }
    }
    const data = await res.json()
    return { success: true, data, isBackendConnected: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Backend service connection unreachable",
      isBackendConnected: false,
    }
  }
}

// 1. Dashboard Overview
export async function getAdminDashboard(): Promise<ServiceResult<unknown>> {
  return requestBackend<unknown>("/dashboard")
}

// 2. User Management
export async function getUsers(): Promise<ServiceResult<AdminUser[]>> {
  return requestBackend<AdminUser[]>("/users")
}

export async function createUser(user: Omit<AdminUser, "id" | "createdAt">): Promise<ServiceResult<AdminUser>> {
  return requestBackend<AdminUser>("/users", {
    method: "POST",
    body: JSON.stringify(user),
  })
}

export async function updateUser(id: string, user: Partial<AdminUser>): Promise<ServiceResult<AdminUser>> {
  return requestBackend<AdminUser>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(user),
  })
}

// 3. Audit Logs
export async function getAuditLogs(): Promise<ServiceResult<AuditLog[]>> {
  return requestBackend<AuditLog[]>("/audit")
}

export async function exportAuditLogs(format: "csv" | "json"): Promise<ServiceResult<Blob>> {
  return requestBackend<Blob>(`/audit/export?format=${format}`)
}

// 4. Model Configuration
export async function getModelConfiguration(): Promise<ServiceResult<ModelConfiguration>> {
  return requestBackend<ModelConfiguration>("/models/config")
}

export async function updateModelConfiguration(config: Partial<ModelConfiguration>): Promise<ServiceResult<ModelConfiguration>> {
  return requestBackend<ModelConfiguration>("/models/config", {
    method: "PUT",
    body: JSON.stringify(config),
  })
}

// 5. Weather Configuration
export async function getWeatherConfiguration(): Promise<ServiceResult<WeatherConfiguration>> {
  return requestBackend<WeatherConfiguration>("/weather/config")
}

export async function updateWeatherConfiguration(config: Partial<WeatherConfiguration>): Promise<ServiceResult<WeatherConfiguration>> {
  return requestBackend<WeatherConfiguration>("/weather/config", {
    method: "PUT",
    body: JSON.stringify(config),
  })
}

// 6. Integrations
export async function getIntegrations(): Promise<ServiceResult<Integration[]>> {
  return requestBackend<Integration[]>("/integrations")
}

export async function testIntegration(id: string): Promise<ServiceResult<{ pingMs: number; status: string }>> {
  return requestBackend<{ pingMs: number; status: string }>(`/integrations/${id}/test`, {
    method: "POST",
  })
}

// 7. Alert Rules
export async function getAlertRules(): Promise<ServiceResult<AlertRule[]>> {
  return requestBackend<AlertRule[]>("/alerts/rules")
}

export async function createAlertRule(rule: Omit<AlertRule, "id" | "lastModified">): Promise<ServiceResult<AlertRule>> {
  return requestBackend<AlertRule>("/alerts/rules", {
    method: "POST",
    body: JSON.stringify(rule),
  })
}

export async function updateAlertRule(id: string, rule: Partial<AlertRule>): Promise<ServiceResult<AlertRule>> {
  return requestBackend<AlertRule>(`/alerts/rules/${id}`, {
    method: "PUT",
    body: JSON.stringify(rule),
  })
}

export async function deleteAlertRule(id: string): Promise<ServiceResult<void>> {
  return requestBackend<void>(`/alerts/rules/${id}`, {
    method: "DELETE",
  })
}

// 8. System Monitoring
export async function getSystemMonitoring(): Promise<ServiceResult<unknown>> {
  return requestBackend<unknown>("/monitoring")
}

// 9. Admin Settings
export async function getAdminSettings(): Promise<ServiceResult<AdminSettings>> {
  return requestBackend<AdminSettings>("/settings")
}

export async function updateAdminSettings(settings: Partial<AdminSettings>): Promise<ServiceResult<AdminSettings>> {
  return requestBackend<AdminSettings>("/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  })
}
