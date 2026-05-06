import { Router } from "express";
import {
  getNotificationById,
  listNotifications,
  listPriorityNotifications,
  viewNotification
} from "../controllers/notificationController.js";

export const notificationRoutes = Router();

notificationRoutes.get("/", listNotifications);
notificationRoutes.get("/priority", listPriorityNotifications);
notificationRoutes.get("/:id", getNotificationById);
notificationRoutes.patch("/:id/viewed", viewNotification);
