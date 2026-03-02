// ============================================================================
// PayrollHub — Vercel Serverless Function Entry Point
// Wraps the Express app for Vercel's serverless runtime
// This file is bundled by esbuild into api/index.mjs during build
// ============================================================================

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./db";
import { storage } from "./storage";
import { authRouter } from "./auth";
import { employeesRouter } from "./routes/employees";
import { usersRouter } from "./routes/users";
import { entreprisesRouter } from "./routes/entreprises";
import { parametresRouter } from "./routes/parametres";
import { dashboardRouter } from "./routes/dashboard";
import { payrollRouter } from "./routes/payroll";
import { congesRouter } from "./routes/conges";
import { documentsRouter } from "./routes/documents";
import { declarationsRouter } from "./routes/declarations";
import { reportsRouter } from "./routes/reports";
import { notificationsRouter } from "./routes/notifications";
import { apiKeysRouter } from "./routes/api-keys";
import { externalApiRouter } from "./routes/external-api";
import { superExternalRouter } from "./routes/super-external";
import { documentRequestsRouter } from "./routes/document-requests";

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
