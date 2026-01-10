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

    if (method === "GET" && url.pathname === "/") {
      return Response.json(
        { message: `Welcome ${RANDOM_NUMBER}` },
        { status: 200 }
      );
    }

    if (method === "POST" && url.pathname === "/get-brandkit") {
      let body;
      try {
        body = await req.json();
      } catch {
        return Response.json({ error: "Invalid JSON body" }, { status: 400 });
      }

      const parsedSchema = RequestSchema.safeParse(body);

      if (!parsedSchema.success) {
        return Response.json(
          {
            error: "Validation failed",
            issues: parsedSchema.error.issues,
          },
          { status: 400 }
        );
      }
      const res = await scrapBrandKit(parsedSchema.data.url);
      return Response.json({ data: res }, { status: 200 });
    }

    if (method === "POST" && url.pathname === "/screenshot") {
      let body;
      try {
        body = await req.json();
      } catch {
        return Response.json({ error: "Invalid JSON body" }, { status: 400 });
      }

      const parsedSchema = RequestSchema.safeParse(body);
      if (!parsedSchema.success) {
        return Response.json(
          {
            error: "Validation failed",
            issues: parsedSchema.error.issues,
          },
          { status: 400 }
        );
      }

      try {
        const screenshot = await captureScreenshot(parsedSchema.data.url);
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
        return Response.json(
          { error: "Failed to capture screenshot" },
          { status: 500 }
        );
      }
    }

    return new Response("Not found", { status: 404 });
  },
});
const scrapBrandKit = async (url: string) => {
  const browser = await chromium.launch({
    headless: false,
  });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
  });
  const page = await context.newPage();
  await page.goto(url, {
    // waitUntil: "networkidle",
  });
  await new Promise<void>((res) => {
    setTimeout(res, 5000);
  });
  const screenshotBuffer = await page.screenshot();
  await browser.close();
  const blob = new Blob([new Uint8Array(screenshotBuffer)], {
    type: "image/png",
  });
  return await getBrandKit(blob);
};
const captureScreenshot = async (url: string) => {
  const browser = await chromium.launch({
    headless: true,
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 800 },
      userAgent:
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    const screenshotBuffer = await page.screenshot({
      clip: { x: 0, y: 0, width: 1200, height: 800 },
      type: "png",
    });
    const bytes = new Uint8Array(screenshotBuffer);
    return bytes;
  } finally {
    await browser.close();
  }
};
