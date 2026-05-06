import { Request, Response } from "express";
import { Log } from "logging_middleware";

export function notFound(req: Request, res: Response) {
  Log("backend", "warn", "middleware", `Route not found: ${req.method} ${req.path}`);

  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route not found: ${req.method} ${req.path}`
    },
    meta: {
      responseTimeMs: typeof res.locals.responseTimeMs === "function" ? res.locals.responseTimeMs() : 0
    }
  });
}
