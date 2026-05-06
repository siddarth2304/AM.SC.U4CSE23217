import { Router } from "express";
import { getHealth } from "../controllers/healthController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const healthRoutes = Router();

healthRoutes.get("/", asyncHandler(getHealth));
