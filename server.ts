import express from "express";
import { createServer as createViteServer } from "vite";
import { createApiApp } from "./src/api-server";

export async function createApp() {
  const app = express();
  const apiApp = createApiApp();

  // Mount API app
  app.use("/api", apiApp);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  // API 404 handler for any non-handled API routes (now using the mounted path)
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: `API route niet gevonden: ${req.method} ${req.originalUrl}` });
  });

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global Error:", err);
    res.status(err.status || 500).json({
      error: err.message || "Interne serverfout",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  });

  return app;
}

if (process.env.NODE_ENV !== "test") {
  createApp().then(app => {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}
