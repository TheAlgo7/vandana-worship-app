import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.clear();
  });
});

test("home renders a calm song search flow", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Vandana/);
  await expect(page.getByPlaceholder("Search songs, lyrics...").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "All", exact: true })).toBeVisible();
  await expect(page.getByText("Aa Prabhu Yeshu aa", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Home/ })).toBeVisible();
});

test("search finds close spellings without extra homepage filters", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder("Search songs, lyrics...").first().fill("Aag Meen");

  await expect(page.getByText("Aag Mein Ek Aur")).toBeVisible();
  await expect(page.getByText("All artists")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Hinglish" })).toHaveCount(0);
});

test("song can be opened, favourited, and found in favourites", async ({ page }) => {
  await page.goto("/");
  await page.getByText("Aa Prabhu Yeshu aa").click();

  await expect(page.getByRole("link", { name: "Present" })).toBeVisible();
  await page.getByRole("button", { name: "Add to favourites" }).click();
  await expect(page.getByRole("button", { name: "Remove from favourites" })).toBeVisible();
  await page.goto("/favourites");

  await expect(page.getByText("Aa Prabhu Yeshu aa", { exact: true }).first()).toBeVisible();
});

test("setlist can queue a song and expose present flow", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Add Aa Prabhu Yeshu aa to setlist/ }).click();
  await page.getByRole("link", { name: /Setlist/ }).click();

  await expect(page.getByRole("link", { name: "Present setlist" })).toBeVisible();
  await expect(page.getByText("Aa Prabhu Yeshu aa", { exact: true }).first()).toBeVisible();
});

test("settings theme toggle updates the app theme", async ({ page }) => {
  await page.goto("/settings");

  await page.getByRole("button", { name: "Switch to light mode" }).click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("present mode opens and keeps core controls available", async ({ page }) => {
  await page.goto("/present/aa-prabhu-yeshu-aa");

  await expect(page.getByText("Aa Prabhu Yeshu aa", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Exit/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start auto-scroll" })).toBeVisible();
});

test("song sections keep worship order", async ({ page }) => {
  await page.goto("/song/deewana-main-yeshu-ka");

  let labels = await page.locator(".section-label").allTextContents();

  expect(labels.slice(0, 5)).toEqual([
    "Pre Chorus",
    "Chorus",
    "Verse 1",
    "Verse 2",
    "Bridge",
  ]);

  await page.goto("/song/chattan");

  labels = await page.locator(".section-label").allTextContents();

  expect(labels.slice(0, 6)).toEqual([
    "Pre Chorus",
    "Chorus",
    "Verse 1",
    "Verse 2",
    "Bridge",
    "Repeat Chorus",
  ]);
});
