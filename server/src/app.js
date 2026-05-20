import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "./config/passport.js";
import authRoutes from "./routes/auth.routes.js";
import repositoryRoutes from "./routes/repository.routes.js";
import aiRoutes from "./modules/ai/routes/ai.routes.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// 1. Core security and logging middleware
app.use(helmet());
app.use(morgan("dev"));

// 2. CORS configuration (must allow credentials and resolve frontend origin from env)
app.use(
  cors({
    credentials: true,
    origin: env.FRONTEND_URL,
  })
);

// 3. Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 4. Session management (required by Passport session strategy)
app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// 5. Initialize Passport and session support
app.use(passport.initialize());
app.use(passport.session());

// 6. Routes
app.use("/api/auth", authRoutes);
app.use("/api/repositories", repositoryRoutes);
app.use("/api/ai", aiRoutes);

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
