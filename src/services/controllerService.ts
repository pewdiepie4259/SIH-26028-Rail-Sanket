import type {
  ControllerTrain,
  OperationalAlert,
} from "../types/controller"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"

export async function getControllerTrains(): Promise<ControllerTrain[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/controller/trains`,
  )

  if (!response.ok) {
    throw new Error("Unable to load controller trains")
  }

  return response.json()
}

export async function getControllerAlerts(): Promise<OperationalAlert[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/controller/alerts`,
  )

  if (!response.ok) {
    throw new Error("Unable to load controller alerts")
  }

  return response.json()
}
