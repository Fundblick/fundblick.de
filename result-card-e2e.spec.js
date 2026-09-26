'use strict';
const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:4173/search.html';

async function waitCard(page){
  await expect(page.locator('#summary')).not.toContainText('Produkte werden geladen');
  await expect(page.locator('#cards article.product').first()).toHaveAttribute('data-real-merchant','true');
}

test('in-stock Ahipos card clearly separates brand merchant type and shipping',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base+'?q='+encodeURIComponent('Ahipos Flexen')+'&lang=de',{waitUntil:'networkidle'});
  await waitCard(page);
  const card=page.locator('#cards article.product').first();
  await expect(card.locator('h2')).toContainText('AHIPOS Flexen +Collagen');
  await expect(card.locator('.product-facts')).toContainText('Hersteller / Marke: Ahipos Horses');
  await expect(card.locator('.product-facts')).toContainText('Händler: Ahipos Horses DE');
  await expect(card.locator('.product-facts')).toContainText('Produkttyp: Ergänzungsfutter');
  await expect(card.locator('.availability-status')).toHaveText('Lieferbar');
  await expect(card.locator('.price small').first()).toHaveText('Gesamtpreis · Kostenloser Versand');
  await expect(card.locator('.merchant-link')).toHaveText('Zum Händler');
  expect(errors).toEqual([]);
});

test('out-of-stock Equinox card does not imply availability or known shipping',async({page})=>{
  await page.goto(base+'?q='+encodeURIComponent('Equinox Dynamic')+'&lang=de',{waitUntil:'networkidle'});
  await waitCard(page);
  const card=page.locator('#cards article.product').first();
  await expect(card.locator('h2')).toContainText('EQUINOX Dynamic');
  await expect(card.locator('.availability-status')).toHaveText('Derzeit nicht lieferbar');
  await expect(card.locator('.availability-status')).toHaveClass(/is-out-of-stock/);
  await expect(card.locator('.price small').first()).toHaveText('Produktpreis · Versandkosten beim Händler prüfen');
  await expect(card.locator('.merchant-link')).toBeVisible();
});

test('Casa Moro cards use the same real merchant information contract',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base+'?q='+encodeURIComponent('Mosaiktisch')+'&lang=de',{waitUntil:'networkidle'});
  await waitCard(page);
  const card=page.locator('#cards article.product').first();
  await expect(card.locator('.product-facts')).toContainText('Händler: Casa Moro DE');
  await expect(card.locator('.product-facts')).toContainText(/Hersteller \/ Marke:/);
  await expect(card.locator('.availability-status')).toBeVisible();
  await expect(card.locator('.price strong')).toContainText('€');
  await expect(card.locator('.price small').first()).not.toContainText(/Test|unbekannt$/i);
  await expect(card.locator('.merchant-link')).toHaveText('Zum Händler');
  expect(errors).toEqual([]);
});

test('mobile result card keeps facts price availability and CTA inside viewport',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(base+'?q='+encodeURIComponent('Mosaiktisch')+'&lang=de',{waitUntil:'networkidle'});
  await waitCard(page);
  const card=page.locator('#cards article.product').first();
  await expect(card.locator('.product-facts')).toContainText('Händler: Casa Moro DE');
  await expect(card.locator('.availability-status')).toBeVisible();
  await expect(card.locator('.merchant-link')).toBeVisible();
  const cardBox=await card.boundingBox(),ctaBox=await card.locator('.merchant-link').boundingBox();
  expect(cardBox).not.toBeNull();expect(ctaBox).not.toBeNull();
  expect(cardBox.x).toBeGreaterThanOrEqual(0);expect(cardBox.x+cardBox.width).toBeLessThanOrEqual(390);
  expect(ctaBox.x).toBeGreaterThanOrEqual(0);expect(ctaBox.x+ctaBox.width).toBeLessThanOrEqual(390);
});

test('Russian result card localizes new customer-facing facts',async({page})=>{
  await page.goto(base+'?q='+encodeURIComponent('Ahipos Flexen')+'&lang=ru',{waitUntil:'networkidle'});
  await waitCard(page);
  const card=page.locator('#cards article.product').first();
  await expect(card.locator('.product-facts')).toContainText('Производитель / бренд: Ahipos Horses');
  await expect(card.locator('.product-facts')).toContainText('Продавец: Ahipos Horses DE');
  await expect(card.locator('.availability-status')).toHaveText('В наличии');
  await expect(card.locator('.merchant-link')).toHaveText('К продавцу');
});
