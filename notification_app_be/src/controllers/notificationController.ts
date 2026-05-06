import { Request, Response } from "express";
import { Log } from "logging_middleware";
import {
  createNotification,
  deleteNotification,
  editNotification,
  getNotification,
  getNotifications,
  getPriority,
  markViewed,
  parseNotificationInput,
  parsePositiveInt,
  parseType
} from "../services/notificationService.js";
import { sendSuccess } from "../utils/response.js";

export async function listNotifications(req: Request, res: Response) {
  const page = parsePositiveInt(req.query.page, 1, 10000, "page");
  const limit = parsePositiveInt(req.query.limit, 10, 100, "limit");
  const type = parseType(req.query.type);

  const result = await getNotifications({ page, limit, type });
  const totalPages = Math.max(1, Math.ceil(result.total / limit));
  await Log("backend", "info", "route", `GET /notifications page=${page} type=${type || "All"}`);

  sendSuccess(res, result.items, {
    page,
    limit,
    type: type || "All",
    total: result.total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  });
}

export async function getNotificationById(req: Request, res: Response) {
  const id = String(req.params.id);
  const item = await getNotification(id);
  await Log("backend", "info", "route", `GET /notifications/${id}`);
  sendSuccess(res, item);
}

export async function listPriorityNotifications(req: Request, res: Response) {
  const limit = parsePositiveInt(req.query.n, 10, 100, "n");
  const result = await getPriority(limit);
  await Log("backend", "info", "route", `GET /notifications/priority n=${limit}`);

  sendSuccess(res, result, {
    limit,
    total: result.length
  });
}

export async function viewNotification(req: Request, res: Response) {
  const id = String(req.params.id);
  const item = await markViewed(id);
  await Log("backend", "info", "route", `PATCH /notifications/${id}/viewed`);
  sendSuccess(res, item);
}

export async function addNotification(req: Request, res: Response) {
  const input = parseNotificationInput(req.body);
  const item = await createNotification(input);
  await Log("backend", "info", "route", "POST /notifications");
  res.status(201);
  sendSuccess(res, item);
}

export async function updateNotification(req: Request, res: Response) {
  const id = String(req.params.id);
  const input = parseNotificationInput(req.body);
  const item = await editNotification(id, input);
  await Log("backend", "info", "route", `PUT /notifications/${id}`);
  sendSuccess(res, item);
}

export async function removeNotification(req: Request, res: Response) {
  const id = String(req.params.id);
  const result = await deleteNotification(id);
  await Log("backend", "info", "route", `DELETE /notifications/${id}`);
  sendSuccess(res, result);
}
