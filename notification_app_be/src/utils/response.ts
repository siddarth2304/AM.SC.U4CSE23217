import { Response } from "express";

export function sendSuccess(res: Response, data: unknown, meta: Record<string, unknown> = {}) {
  res.json({
    success: true,
    data,
    meta: {
      ...meta,
      responseTimeMs: res.locals.responseTimeMs()
    }
  });
}
