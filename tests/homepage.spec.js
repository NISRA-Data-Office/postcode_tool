// @ts-check
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Deprivation in Northern Ireland/);
});

test('postcode search goes to data zone page', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Search for a postcode').fill('BT9 5RR');
  await page.locator('#postcode-go').click();

  await expect(page).toHaveTitle(/BT9 5RR/);
  await expect(page).toHaveURL(/sdz.html/);
  await expect(page).toHaveURL(/N21000264/);
});

test('council selection goes to council page', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Select a council area').selectOption({ label: 'Antrim and Newtownabbey' });

  await expect(page).toHaveTitle(/Antrim and Newtownabbey/);
  await expect(page).toHaveURL(/area.html/);
  await expect(page).toHaveURL(/N09000001/);
});
