import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { scrapBrandKit, captureScreenshot } from "../services/scraper.service";

const brandkitRoutes = new Hono();

const UrlSchema = z.object({
  url: z.string().url(),
});

brandkitRoutes.post(
  "/get-brandkit",
  zValidator("json", UrlSchema),
  async (c) => {
    const { url } = c.req.valid("json");
    const result = await scrapBrandKit(url);
    return c.json({ data: result });
  }
);

brandkitRoutes.post(
  "/screenshot",
  zValidator("json", UrlSchema),
  async (c) => {
    try {
      const { url } = c.req.valid("json");
      const screenshot = await captureScreenshot(url);
      const blob = new Blob([screenshot], { type: "image/png" });
      return new Response(blob, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Content-Length": screenshot.byteLength.toString(),
        },
      });
    } catch (error) {
      console.error("Screenshot error:", error);
      return c.json({ error: "Failed to capture screenshot" }, 500);
    }
  }
);

export { brandkitRoutes };
