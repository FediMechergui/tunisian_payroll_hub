// ============================================================================
// PayrollHub — Vercel Serverless Function Entry Point
// Wraps the Express app for Vercel's serverless runtime
// ============================================================================

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "../server/db";
import { storage } from "../server/storage";
import { authRouter } from "../server/auth";
import { employeesRouter } from "../server/routes/employees";
import { usersRouter } from "../server/routes/users";
import { entreprisesRouter } from "../server/routes/entreprises";
import { parametresRouter } from "../server/routes/parametres";
import { dashboardRouter } from "../server/routes/dashboard";
import { payrollRouter } from "../server/routes/payroll";
import { congesRouter } from "../server/routes/conges";
import { documentsRouter } from "../server/routes/documents";
import { declarationsRouter } from "../server/routes/declarations";
import { reportsRouter } from "../server/routes/reports";
import { notificationsRouter } from "../server/routes/notifications";
import { apiKeysRouter } from "../server/routes/api-keys";
import { externalApiRouter } from "../server/routes/external-api";
import { superExternalRouter } from "../server/routes/super-external";
import { documentRequestsRouter } from "../server/routes/document-requests";

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/employees", employeesRouter);
app.use("/api/users", usersRouter);
app.use("/api/entreprises", entreprisesRouter);
app.use("/api/parametres", parametresRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/payroll", payrollRouter);
app.use("/api/conges", congesRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/declarations", declarationsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/api-keys", apiKeysRouter);
app.use("/api/v1", externalApiRouter);
app.use("/api/super-external", superExternalRouter);
app.use("/api/document-requests", documentRequestsRouter);

// DB connection (cached across warm invocations)
let dbConnected = false;
async function ensureDB() {
  if (!dbConnected) {
    await connectDB();
    await storage.seed();
    dbConnected = true;
  }
}

// Wrap with DB initialization
const handler = async (req: any, res: any) => {
  await ensureDB();
  return app(req, res);
};

export default handler;
