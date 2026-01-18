import { Hono } from "hono";
import { logger } from "hono/logger";
import { routes } from "./routes";

const app = new Hono();

app.use(logger());

app.route("/", routes);

const port = Number(process.env.PORT) || 8002;

console.log(`Server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
