import type { Page } from "playwright";

export const getBrandColors = async (page: Page) =>
  await page.evaluate(() => {
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
