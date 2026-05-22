import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import passport from "./config/passport.js";
import authRoutes from "./routes/auth.routes.js";
import repositoryRoutes from "./routes/repository.routes.js";
import aiRoutes from "./modules/ai/routes/ai.routes.js";
import reviewRoutes from "./modules/review/routes/review.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import debugRoutes from "./modules/debug/routes/debug.routes.js";
import notificationRoutes from "./routes/notifications.routes.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.set("trust proxy", 1);

// 1. Core security and logging middleware
app.use(helmet());
app.use(morgan("dev"));

// 2. CORS configuration (must allow credentials and resolve frontend origin from env)
const allowedOrigins = env.FRONTEND_URL.split(",").map((o) => o.trim());
app.use(
  cors({
    credentials: true,
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.some((o) => origin.startsWith(o))) return cb(null, true);
      cb(null, false);
    },
  })
);

// 3. Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Initialize Passport (JWT-based, no sessions)
app.use(passport.initialize());

// 6. Routes
app.use("/api/auth", authRoutes);
app.use("/api/repositories", repositoryRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/debug", debugRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running smoothly",
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

// 7. Error handling middleware (must be registered last!)
app.use(errorHandler);

export default app;
