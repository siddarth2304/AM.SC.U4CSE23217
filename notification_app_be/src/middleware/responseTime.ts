import { NextFunction, Request, Response } from "express";

export function responseTime(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();

  res.locals.responseTimeMs = () => {
    const diff = process.hrtime.bigint() - start;
    return Number(diff / 1000000n);
  };

  next();
}
