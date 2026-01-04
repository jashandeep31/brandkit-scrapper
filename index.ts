import { chromium } from "playwright";

console.log(`Firing up the brandkit scrapper :)`);
const server = Bun.serve({
  port: 8002,
  routes: {
    "/": () => new Response("Bun!"),
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
  await page.goto("https://jashan.dev", {
    waitUntil: "networkidle",
  });
  const title = await page.title();
  console.log(title);
  await page.screenshot({
    path: "secondary.png",
  });
  await browser.close();
};
scrapBrandKit();
console.log(`Listening on ${server.url}`);
