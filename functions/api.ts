import serverless from "serverless-http";
import express from "express";
import { createApiApp } from "../src/api-server";

const apiApp = createApiApp();
const app = express();

// Handle both paths just in case to avoid 404s in Netlify environment
app.use("/.netlify/functions/api", apiApp);
app.use("/api", apiApp);
app.use("/", apiApp);

export const handler = serverless(app);
