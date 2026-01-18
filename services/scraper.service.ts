import { chromium } from "playwright";
import { getBrandKit } from "../ai/get-brand-kit";

export const scrapBrandKit = async (url: string) => {
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

export const captureScreenshot = async (url: string) => {
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
