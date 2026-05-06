import { Request, Response } from "express";
import { sendSuccess } from "../utils/response.js";

export function getHealth(req: Request, res: Response) {
  sendSuccess(res, {
    status: "ok",
    service: "campus-notification-api"
  });
}
