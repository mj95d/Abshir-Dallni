import puppeteer from "puppeteer";
import { mkdir } from "fs/promises";

async function snap() {
  await mkdir("docs/screenshots", { recursive: true });
  const browser = await puppeteer.launch({ headless: true });
  const targets = [
    { path: "/", file: "home.png" },
    { path: "/security", file: "security.png" },
    { path: "/assistant", file: "assistant.png" },
  ];

  for (const t of targets) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
    const url = `http://localhost:${process.env.PORT || "5000"}${t.path}`;
    try {
      await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
    } catch {
      await page.goto("about:blank");
    }
    await page.screenshot({ path: `docs/screenshots/${t.file}`, fullPage: true });
    await page.close();
  }

  await browser.close();
}

snap().catch((e) => {
  console.error(e);
  process.exit(1);
});
