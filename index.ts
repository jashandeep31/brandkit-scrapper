import { color } from "bun";
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
  await page.goto("https://stripe.com/in", {
    // waitUntil: "networkidle",
  });
  await new Promise<void>((res) => {
    setTimeout(res, 5000);
  });
  console.log("Main work started");
  const colors = await page.evaluate(() => {
    const map = new Map<string, number>();

    const add = (color: string) => {
      if (!color || color === "transparent" || color === "rgba(0, 0, 0, 0)")
        return;
      map.set(color, (map.get(color) ?? 0) + 1);
    };
    document.querySelectorAll("*").forEach((el) => {
      const cs = getComputedStyle(el);
      add(cs.color);
      add(cs.backgroundColor);
    });

    return Array.from(map.entries())
      .map(([color, count]) => ({ color, count }))
      .sort((a, b) => b.count - a.count);
  });

  console.log(colors);
  await page.screenshot({
    path: "secondary.png",
  });
  await browser.close();
};
scrapBrandKit();
console.log(`Listening on ${server.url}`);
