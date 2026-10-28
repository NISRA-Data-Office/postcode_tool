// @ts-check
import { test, expect } from '@playwright/test';

test('super data zones are described', async ({ page }) => {
    await page.goto('/sdz.html?sdz=N21000850');
    await expect(page).toHaveTitle(/Ards Peninsula N/);
    await expect(page.locator('#headline')).toHaveText(/Ards Peninsula N/);
    await expect(page.locator('#geo-description')).toHaveText(/Ards Peninsula N is a Super Data Zone, in Ards and North Down/);
    await expect(page.locator('#geo-description')).toHaveText(/Super Data Zones - referred to here as \'neighbourhoods\' - have an average population of 2,240 people./);
    await expect(page.locator('#summary-heading')).toHaveText(/Ards Peninsula N/);
});

test('can navigate from super data zone to lgd', async ({ page }) => {
    await page.goto('/sdz.html?sdz=N21000850');
    await page.getByRole('link', { name: 'Ards and North Down', description: 'View deprivation profile for Ards and North Down' }).click();
    await expect(page).toHaveURL(/N09000011/);
});

test('can change deprivation type', async ({ page }) => {
    await page.goto('/sdz.html?sdz=N21000850');
    await page.getByLabel('Select a type of deprivation').selectOption('employment');
    await expect(page.locator('#comparison-text')).toHaveText(/employment/);
});
