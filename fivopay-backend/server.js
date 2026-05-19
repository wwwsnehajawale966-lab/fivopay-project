import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import plannerRoutes from "./routes/plannerRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

dotenv.config();

const app = express();

// middleware
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      console.error('INVALID JSON RECEIVED:', buf.toString());
    }
  }
}));

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/analytics", analyticsRoutes);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Error Handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON Syntax Error:', err.message);
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  console.error('GLOBAL ERROR:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Keep Render free tier alive
setInterval(() => { }, 1000);
