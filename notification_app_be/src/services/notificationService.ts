import { Log } from "logging_middleware";
import {
  findNotificationById,
  findNotifications,
  findPriorityNotifications,
  setViewed
} from "../repositories/notificationRepository.js";
import { NotificationQuery, NotificationType } from "../types/notification.js";
import { HttpError } from "../utils/httpError.js";

const types: NotificationType[] = ["Placement", "Result", "Event"];

export function parsePositiveInt(value: unknown, fallback: number, max: number, name: string) {
  const number = value === undefined ? fallback : Number(value);

  if (!Number.isInteger(number) || number < 1) {
    throw new HttpError(400, "BAD_REQUEST", `${name} must be a positive integer`);
  }

  return Math.min(number, max);
}

export function parseType(value: unknown) {
  if (value === undefined || value === "" || value === "All") {
    return undefined;
  }

  if (typeof value !== "string" || !types.includes(value as NotificationType)) {
    throw new HttpError(400, "BAD_REQUEST", "Invalid type. Use Placement, Result, or Event.");
  }

  return value as NotificationType;
}

export async function getNotifications(query: NotificationQuery) {
  const result = await findNotifications(query);
  await Log("backend", "info", "service", `Fetched ${result.items.length} notifications`);
  return result;
}

export async function getNotification(id: string) {
  const item = await findNotificationById(id);
  if (!item) {
    throw new HttpError(404, "NOT_FOUND", "Notification not found");
  }

  await Log("backend", "info", "service", `Fetched notification ${id}`);
  return item;
}

export async function getPriority(limit: number) {
  const result = await findPriorityNotifications(limit);
  await Log("backend", "info", "service", `Fetched ${result.length} priority notifications`);
  return result;
}

export async function markViewed(id: string) {
  if (!id.trim()) {
    throw new HttpError(400, "BAD_REQUEST", "Notification id is required");
  }

  const item = await setViewed(id);
  await Log("backend", "info", "service", `Notification ${id} marked viewed`);
  return item;
}
