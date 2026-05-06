import { Router } from "express";
import {
  addNotification,
  getNotificationById,
  listNotifications,
  listPriorityNotifications,
  removeNotification,
  updateNotification,
  viewNotification
} from "../controllers/notificationController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const notificationRoutes = Router();

notificationRoutes.get("/", asyncHandler(listNotifications));
notificationRoutes.post("/", asyncHandler(addNotification));
notificationRoutes.get("/priority", asyncHandler(listPriorityNotifications));
notificationRoutes.get("/:id", asyncHandler(getNotificationById));
notificationRoutes.put("/:id", asyncHandler(updateNotification));
notificationRoutes.delete("/:id", asyncHandler(removeNotification));
notificationRoutes.patch("/:id/viewed", asyncHandler(viewNotification));
