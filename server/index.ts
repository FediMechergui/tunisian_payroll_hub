// ============================================================================
// PayrollHub — Server Entry Point
// Express server with API routes + SPA static serving + MongoDB
// ============================================================================

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
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
import { loansRouter } from "./routes/loans";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Connect to MongoDB
  await connectDB();
  await storage.seed();

  const app = express();
  const server = createServer(app);

  // Middleware
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  // Serve uploaded files (authenticated)
  app.use("/uploads", express.static(path.resolve("uploads")));

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
  app.use("/api/loans", loansRouter);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
