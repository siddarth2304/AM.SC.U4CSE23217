import { Request, Response } from "express";
import { Log } from "logging_middleware";
import { sendSuccess } from "../utils/response.js";

export async function getHealth(req: Request, res: Response) {
  await Log("backend", "info", "route", "GET /health");

  sendSuccess(res, {
    status: "ok",
    service: "campus-notification-api"
  });
}
