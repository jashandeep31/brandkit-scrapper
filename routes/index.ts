import { Hono } from "hono";
import { brandkitRoutes } from "./brandkit.routes";

const routes = new Hono();

routes.get("/", (c) => {
  return c.json({ message: "Welcome to BrandKit Scraper API" });
});

routes.route("/", brandkitRoutes);

export { routes };
