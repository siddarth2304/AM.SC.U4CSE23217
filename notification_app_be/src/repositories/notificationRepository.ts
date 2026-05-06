import { Log } from "logging_middleware";
import { env } from "../config/env.js";
import { NotificationItem, NotificationQuery, NotificationType } from "../types/notification.js";
import { HttpError } from "../utils/httpError.js";

const fallbackItems: NotificationItem[] = [
  {
    id: "1",
    title: "Placement Drive",
    message: "A campus placement drive starts at 10 AM in the auditorium.",
    type: "Placement",
    createdAt: "2026-05-06T08:30:00.000Z",
    viewed: false
  },
  {
    id: "2",
    title: "Semester Result Published",
    message: "Semester 6 results are available in the student portal.",
    type: "Result",
    createdAt: "2026-05-05T14:20:00.000Z",
    viewed: false
  },
  {
    id: "3",
    title: "Tech Fest Registration",
    message: "Registrations close tomorrow at 6 PM.",
    type: "Event",
    createdAt: "2026-05-04T11:15:00.000Z",
    viewed: true
  },
  {
    id: "4",
    title: "Internship Shortlist",
    message: "Shortlisted students should report to the placement cell.",
    type: "Placement",
    createdAt: "2026-05-06T05:10:00.000Z",
    viewed: false
  },
  {
    id: "5",
    title: "Revaluation Window",
    message: "Students can apply for result revaluation until Friday.",
    type: "Result",
    createdAt: "2026-05-02T12:00:00.000Z",
    viewed: true
  },
  {
    id: "6",
    title: "Hackathon Briefing",
    message: "Team briefing is scheduled in Lab 2.",
    type: "Event",
    createdAt: "2026-05-03T09:00:00.000Z",
    viewed: false
  }
];

const rank: Record<NotificationType, number> = {
  Placement: 1,
  Result: 2,
  Event: 3
};

let loaded = false;
let items: NotificationItem[] = [];

function isType(value: string): value is NotificationType {
  return ["Placement", "Result", "Event"].includes(value);
}

function normalize(raw: Record<string, unknown>, index: number): NotificationItem {
  const type = String(raw.type ?? raw.notificationType ?? "Event");

  return {
    id: String(raw.id ?? raw.notificationId ?? index + 1),
    title: String(raw.title ?? raw.name ?? "Campus notification"),
    message: String(raw.message ?? raw.description ?? ""),
    type: isType(type) ? type : "Event",
    createdAt: new Date(String(raw.createdAt ?? raw.timestamp ?? Date.now())).toISOString(),
    viewed: Boolean(raw.viewed ?? raw.isRead ?? false)
  };
}

async function loadItems() {
  if (loaded) {
    return items;
  }

  if (env.notificationApiUrl) {
    try {
      const response = await fetch(env.notificationApiUrl);
      if (!response.ok) {
        throw new Error(`External API returned ${response.status}`);
      }

      const body = (await response.json()) as { data?: unknown } | unknown[];
      const list = Array.isArray(body) ? body : body.data;

      if (Array.isArray(list)) {
        items = list.map((item, index) => normalize(item as Record<string, unknown>, index));
        loaded = true;
        await Log("backend", "info", "repository", "Loaded notifications from external API");
        return items;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown external API error";
      await Log("backend", "warn", "repository", message);
    }
  }

  items = fallbackItems.map((item) => ({ ...item }));
  loaded = true;
  await Log("backend", "info", "repository", "Using fallback notification data");
  return items;
}

function newestFirst(a: NotificationItem, b: NotificationItem) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export async function findNotifications(query: NotificationQuery) {
  const data = await loadItems();
  const filtered = query.type ? data.filter((item) => item.type === query.type) : data;
  const sorted = [...filtered].sort(newestFirst);
  const start = (query.page - 1) * query.limit;

  return {
    items: sorted.slice(start, start + query.limit),
    total: sorted.length
  };
}

export async function findPriorityNotifications(limit: number) {
  const data = await loadItems();

  return [...data]
    .sort((a, b) => {
      const rankDiff = rank[a.type] - rank[b.type];
      return rankDiff || newestFirst(a, b);
    })
    .slice(0, limit);
}

export async function findNotificationById(id: string) {
  const data = await loadItems();
  return data.find((item) => item.id === id);
}

export async function setViewed(id: string) {
  const item = await findNotificationById(id);

  if (!item) {
    throw new HttpError(404, "NOT_FOUND", "Notification not found");
  }

  item.viewed = true;
  return item;
}
