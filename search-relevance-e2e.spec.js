'use strict';
const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:4173/search.html';

async function waitResults(page){
  await expect(page.locator('#summary')).not.toContainText('Produkte werden geladen');
}

async function firstTitle(page,query){
  await page.goto(base+'?q='+encodeURIComponent(query)+'&lang=de',{waitUntil:'networkidle'});
  await waitResults(page);
  await expect(page.locator('#cards article.product').first()).toBeVisible();
  return (await page.locator('#cards article.product h2').first().textContent()||'').trim();
}

test('semantic equestrian query finds joint product',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(String(error)));
  await page.goto(base+'?q='+encodeURIComponent('Pferd Gelenke')+'&lang=de',{waitUntil:'networkidle'});
  await waitResults(page);
  await expect(page.locator('#cards article.product')).toHaveCount(1);
  await expect(page.locator('#cards article.product h2').first()).toContainText(/Gelenk|Flexen/i);
  expect(errors).toEqual([]);
});

test('conservative spelling correction recovers Mosaiktih',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(String(error)));
  await page.goto(base+'?q='+encodeURIComponent('Mosaiktih')+'&lang=de',{waitUntil:'networkidle'});
  await waitResults(page);
  expect(new URL(page.url()).searchParams.get('q')).toBe('Mosaiktisch');
  await expect(page.locator('#query')).toHaveValue('Mosaiktisch');
  await expect(page.locator('#cards article.product').first()).toBeVisible();
  await expect(page.locator('#cards article.product h2').first()).toContainText(/Mosaik/i);
  expect(errors).toEqual([]);
});

test('exact brand search remains stable',async({page})=>{
  await page.goto(base+'?q=Equinox&lang=de',{waitUntil:'networkidle'});
  await waitResults(page);
  await expect(page.locator('#summary')).toContainText(/^5 /);
  await expect(page.locator('#cards article.product h2').first()).toContainText(/EQUINOX/i);
  expect(new URL(page.url()).searchParams.get('q')).toBe('Equinox');
});

test('product type prefix outranks feed order',async({page})=>{
  await page.goto(base+'?q=Mosaiktisch&lang=de',{waitUntil:'networkidle'});
  await waitResults(page);
  await expect(page.locator('#cards article.product').first()).toBeVisible();
  await expect(page.locator('#cards article.product h2').first()).toHaveText(/^Mosaiktisch\b/i);
});

test('brand plus product type is stable across word order',async({page})=>{
  const forward=await firstTitle(page,'Equinox Zusatzfutter');
  const reverse=await firstTitle(page,'Zusatzfutter Equinox');
  expect(reverse).toBe(forward);
  expect(forward).toMatch(/EQUINOX/i);
});

test('partial product term plus specification ranks a matching title first',async({page})=>{
  const title=await firstTitle(page,'Mosaik Stern');
  expect(title).toMatch(/Mosaik/i);
  expect(title).toMatch(/Stern/i);
});
