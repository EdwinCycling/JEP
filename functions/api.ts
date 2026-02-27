import serverless from "serverless-http";
import { createApiApp } from "../src/api-server";

const app = createApiApp();

// serverless-http handles the mapping of the Netlify event to Express
// We don't need to wrap it in another express app here if createApiApp already returns one.
export const handler = serverless(app, {
  // This helps when the function is called via a redirect
  basePath: "/api"
});
