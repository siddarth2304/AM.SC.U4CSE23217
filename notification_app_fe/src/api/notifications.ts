import { Log } from "logging_middleware";
import { ApiResponse, FilterType, NotificationItem } from "../types";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request<T>(path: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options
    });

    const body = (await response.json()) as ApiResponse<T>;

    if (!response.ok || body.success === false) {
      throw new Error(body.error?.message || "Request failed");
    }

    return body;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown API error";
    await Log("frontend", "error", "api", `${path} failed: ${message}`);
    throw err;
  }
}

export function getNotifications(type: FilterType, page: number, limit: number) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  if (type !== "All") {
    params.set("type", type);
  }

  return request<NotificationItem[]>(`/notifications?${params.toString()}`);
}

export function getPriorityNotifications(limit: number) {
  return request<NotificationItem[]>(`/notifications/priority?n=${limit}`);
}

export function markNotificationViewed(id: string) {
  return request<NotificationItem>(`/notifications/${id}/viewed`, {
    method: "PATCH"
  });
}
