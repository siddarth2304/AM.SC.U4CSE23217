import dotenv from "dotenv";
import { Log } from "logging_middleware";

dotenv.config();

const parsedPort = Number(process.env.PORT || 5000);

export const env = {
  port: Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 5000,
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  notificationApiUrl: process.env.NOTIFICATION_API_URL || ""
};

if (env.port !== parsedPort) {
  Log("backend", "warn", "config", "Invalid PORT value, using 5000");
}
