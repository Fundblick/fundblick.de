'use strict';
const {test,expect}=require('@playwright/test');
const home='http://127.0.0.1:4173/';
const seo='http://127.0.0.1:4174/';

const pages=[
  ['wohnen','https://fundblick.de/themen/wohnen/','category=home.living'],
  ['moebel','https://fundblick.de/themen/moebel/','category=home.furniture'],
  ['beleuchtung','https://fundblick.de/themen/beleuchtung/','category=home.lighting'],
  ['dekoration','https://fundblick.de/themen/dekoration/','category=home.decor'],
  ['pferd-reitsport','https://fundblick.de/themen/pferd-reitsport/','category=pet.equestrian'],
  ['pferde-ergaenzungsfutter','https://fundblick.de/themen/pferde-ergaenzungsfutter/','category=pet.equestrian']
];

test('homepage keeps product category search links without duplicate SEO topic block',async({page})=>{
  await page.goto(home,{waitUntil:'networkidle'});
  await expect(page.locator('#topics')).toHaveCount(0);
  await expect(page.locator('a[href^="/themen/"]')).toHaveCount(0);
  await expect(page.locator('#categories a[href="search.html?category=home.furniture"]')).toHaveCount(1);
  await expect(page.locator('#categories a[href="search.html?category=pet.equestrian"]')).toHaveCount(1);
});

test('SEO landing canonicals and search CTAs preserve stable filters',async({page})=>{
  for(const [slug,canonical,filter] of pages){
    await page.goto(seo+`themen/${slug}/`,{waitUntil:'domcontentloaded'});
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','index,follow');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',canonical);
    const cta=page.locator('a.cta');
    await expect(cta).toBeVisible();
    const href=await cta.getAttribute('href');
    expect(href).toContain('/search.html?');
    expect(decodeURIComponent(href)).toContain(filter);
    await expect(page.locator('h1')).not.toBeEmpty();
    await expect(page.locator('.meta').first()).toContainText(/Produkte aus \d+ Produktgruppen/);
  }
});

test('thin categories stay absent from generated sitemap',async({page})=>{
  const response=await page.request.get(seo+'sitemap.xml');
  expect(response.ok()).toBeTruthy();
  const xml=await response.text();
  expect(xml).toContain('https://fundblick.de/themen/moebel/');
  expect(xml).toContain('https://fundblick.de/themen/pferd-reitsport/');
  expect(xml).not.toContain('/themen/hund/');
  expect(xml).not.toContain('/themen/nahrungsergaenzung/');
});

test('Russian homepage also omits duplicate SEO topic block',async({page})=>{
  await page.goto(home+'?lang=ru',{waitUntil:'networkidle'});
  await expect(page.locator('#fundblickTopics')).toHaveCount(0);
  await expect(page.locator('#topics')).toHaveCount(0);
  await expect(page.locator('a[href^="/themen/"]')).toHaveCount(0);
});
