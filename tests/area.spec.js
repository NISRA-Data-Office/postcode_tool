// @ts-check
import { test, expect } from '@playwright/test';

test('area name and summary are displayed correctly', async ({ page }) => {
    await page.goto('/area.html?code=N09000001');
    
    await expect(page).toHaveTitle(/Antrim and Newtownabbey/);
    await expect(page.locator('#headline')).toContainText('Antrim and Newtownabbey');
    await expect(page.locator('#content')).toContainText('Overall MDM');
    await expect(page.locator('#sdz-description')).toContainText('made up of 67 neighbourhoods');
    await expect(page.locator('#summary-heading')).toContainText('Antrim and Newtownabbey');
});

test('changing area works', async ({ page }) => {
    await page.goto('/area.html?code=N09000001');

    await page.getByLabel('Select a council area').selectOption('N09000006');
    
    await expect(page).toHaveTitle(/Fermanagh and Omagh/);
    await expect(page).toHaveURL(/N09000006/);
    await expect(page.locator('#headline')).toContainText('Fermanagh and Omagh');
    await expect(page.locator('#content')).toContainText('Overall MDM');
    await expect(page.getByRole('cell', { name: 'Enniskillen B' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Macedon G' })).not.toBeVisible();
    await expect(page.locator('#sdz-description')).toContainText('made up of 49 neighbourhoods');
    await expect(page.locator('#summary-heading')).toContainText('Fermanagh and Omagh');
});

test('changing deprivation type updates page', async ({ page }) => {
    await page.goto('/area.html?code=N09000007');

    await page.getByLabel('Select a type of deprivation').selectOption('crime');
    
    await expect(page).toHaveTitle(/Lisburn and Castlereagh/);
    await expect(page.locator('#content')).toContainText('Crime and disorder');
    await expect(page.locator('#summary-heading')).toContainText('Crime and disorder');
});

test('csv download', async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto('/');
  await page.getByLabel('Select a council area').selectOption("N92000002");
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#download-page-btn').click();
  await page.locator('#page-download-csv').click();
  const download = await downloadPromise;
  await expect(download.suggestedFilename()).toEqual('overall-deprivation-in-northern-ireland.csv')
});

test('can focus on area from table', async ({ page }) => {
    await page.goto('/area.html?code=N09000007');
    await page.getByRole('cell', { name: 'Lisburn South K' }).click();
    await expect(page).toHaveURL(/N21000535/);
    await expect(page.locator('#focus-link')).toHaveText('Lisburn South K');
    await expect(page.locator('#comparison-text')).toHaveText(/Lisburn South K/);
    await page.getByRole('link', { name: 'Lisburn South K' }).click();
    await expect(page).toHaveURL(/sdz.html/);
    await expect(page).toHaveURL(/N21000535/);
});
