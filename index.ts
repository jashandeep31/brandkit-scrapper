import { chromium } from "playwright";
import { getBrandKit } from "./ai/get-brand-kit";
import { z } from "zod";
const RANDOM_NUMBER = Math.floor(Math.random() * 100);
const RequestSchema = z.object({
  url: z.string(),
});
Bun.serve({
  port: 8002,
  async fetch(req) {
    const url = new URL(req.url);
    const method = req.method;
    if (url.pathname === "/") {
      return new Response(
        JSON.stringify({ message: `Welcome ${RANDOM_NUMBER}` }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    if (method === "POST" && url.pathname === "/getbrand-kit") {
      const body = await req.json();
      const parsedSchema = RequestSchema.parse(body);
      return new Response(JSON.stringify({ parsedSchema }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response("Not found", { status: 404 });
  },
});

const scrapBrandKit = async () => {
  const browser = await chromium.launch({
    headless: false,
  });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
  });
  const page = await context.newPage();
  await page.goto("https://www.prisma.io/", {
    // waitUntil: "networkidle",
  });
  await new Promise<void>((res) => {
    setTimeout(res, 5000);
  });
  console.log("Main work started");
  await page.screenshot({
    path: "secondary.png",
  });
  await browser.close();
};
const image = Bun.file("secondary.png");
// scrapBrandKit();
await getBrandKit(image);
