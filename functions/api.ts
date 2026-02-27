import serverless from "serverless-http";
import { createApiApp } from "../src/api-server";

const app = createApiApp();

export const handler = serverless(app);
