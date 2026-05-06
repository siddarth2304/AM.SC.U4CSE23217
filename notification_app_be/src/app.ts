import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { responseTime } from "./middleware/responseTime.js";
import { healthRoutes } from "./routes/healthRoutes.js";
import { notificationRoutes } from "./routes/notificationRoutes.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.frontendOrigin }));
  app.use(express.json());
  app.use(responseTime);

  app.use("/api/health", healthRoutes);
  app.use("/api/notifications", notificationRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
