// ============================================================================
// PayrollHub — Server Entry Point
// Express server with API routes + SPA static serving
// ============================================================================

import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import { authRouter } from "./auth";
import { employeesRouter } from "./routes/employees";
import { usersRouter } from "./routes/users";
import { entreprisesRouter } from "./routes/entreprises";
import { parametresRouter } from "./routes/parametres";
import { dashboardRouter } from "./routes/dashboard";
import { payrollRouter } from "./routes/payroll";
import { congesRouter } from "./routes/conges";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
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

  // API Routes
  app.use("/api/auth", authRouter);
  app.use("/api/employees", employeesRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/entreprises", entreprisesRouter);
  app.use("/api/parametres", parametresRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/payroll", payrollRouter);
  app.use("/api/conges", congesRouter);

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
