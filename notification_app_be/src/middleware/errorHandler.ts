import { NextFunction, Request, Response } from "express";
import { Log } from "logging_middleware";

type AppError = Error & {
  status?: number;
  code?: string;
};

export function errorHandler(err: AppError, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    next(err);
    return;
  }

  const status = err.status || 500;
  const code = err.code || (status === 500 ? "INTERNAL_ERROR" : "BAD_REQUEST");
  const message = status === 500 ? "Internal server error" : err.message;

  Log("backend", status >= 500 ? "error" : "warn", "handler", `${req.method} ${req.path}: ${err.message}`);

  res.status(status).json({
    success: false,
    error: { code, message },
    meta: {
      responseTimeMs: typeof res.locals.responseTimeMs === "function" ? res.locals.responseTimeMs() : 0
    }
  });
}
