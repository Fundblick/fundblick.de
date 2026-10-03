'use strict';
const {test,expect}=require('@playwright/test');
const approvals=JSON.parse(require('node:fs').readFileSync('production-merchant-approvals.json','utf8'));
const expectedCategories={'home.living':516,'home.furniture':394,'home.lighting':268,'home.decor':250,'pet.equestrian':29,'pet.dog':1,'health.supplements':1,'home.garden.robot-mowers':33,'home.garden.robot-mower-accessories':23};
if(approvals.merchants.amazgifts.approved===true)Object.assign(expectedCategories,require('./merchant-production-artifact.js').productionArtifactFor('amazgifts').categoryCounts);

const base='http://127.0.0.1:4173/';

test('every homepage production category opens with results',async({page})=>{
  await page.goto(base+'?lang=de',{waitUntil:'networkidle'});
  const links=page.getByRole('navigation',{name:'Produktkategorien'}).locator('a[data-live-category="true"]');
  const categories=await links.evaluateAll(nodes=>nodes.map(node=>({
    id:node.getAttribute('data-catalog-category'),
    href:node.getAttribute('href'),
    expected:Number((node.getAttribute('title')||'').match(/\d+/)?.[0]||0)
  })));
  expect(categories).toHaveLength(Object.keys(expectedCategories).length);
  expect(categories.map(item=>item.id).sort()).toEqual(Object.keys(expectedCategories).sort());
  for(const item of categories){
    expect(item.id).toBeTruthy();
    expect(item.expected).toBeGreaterThan(0);
    expect(item.expected).toBe(expectedCategories[item.id]);
    await page.goto(new URL(item.href,base).href,{waitUntil:'networkidle'});
    const count=Number((await page.locator('#summary').textContent()).match(/\d+/)?.[0]||0);
    expect(count, item.id+' must return every indexed product').toBe(item.expected);
    await expect(page.locator('#cards article.product')).toHaveCount(item.expected);
    await expect(page.locator('html')).toHaveAttribute('data-search-health','ok');
    await expect(page.locator('#cards article.product').first(),item.id+' must render a product card').toBeVisible();
  }
});

test('homepage categories follow the production taxonomy manifest',async({page})=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base+'?lang=de',{waitUntil:'networkidle'});
  const categoryNav=page.getByRole('navigation',{name:'Produktkategorien'});
  const links=categoryNav.locator('a[data-live-category="true"]');
  await expect(links).toHaveCount(Object.keys(expectedCategories).length);
  for(const [id,count] of Object.entries(expectedCategories))await expect(categoryNav.locator(`a[data-catalog-category="${id}"]`)).toHaveAttribute('title',`${count} ${count===1?'Produkt':'Produkte'}`);
  await expect(categoryNav).toContainText('Pferd & Reitsport');
  await expect(categoryNav).toContainText('Hund');
  await expect(categoryNav).toContainText('Gesundheit & Nahrungsergänzung');
  await expect(categoryNav).toContainText('Mähroboter');
  await expect(categoryNav).toContainText('Mähroboter-Zubehör');
  await expect(categoryNav.locator('a[data-catalog-category="pet.equestrian"]')).toHaveAttribute('title','29 Produkte');
  await expect(categoryNav.locator('a[data-catalog-category="pet.dog"]')).toHaveAttribute('title','1 Produkt');
  await expect(categoryNav.locator('a[data-catalog-category="health.supplements"]')).toHaveAttribute('title','1 Produkt');
  await expect(categoryNav.locator('a[data-catalog-category="home.garden.robot-mowers"]')).toHaveAttribute('title','33 Produkte');
  await expect(categoryNav.locator('a[data-catalog-category="home.garden.robot-mower-accessories"]')).toHaveAttribute('title','23 Produkte');

  await page.locator('#language').selectOption('ru');
  const categoryNavRu=page.getByRole('navigation',{name:'Категории товаров'});
  await expect(categoryNavRu).toContainText('Лошади и конный спорт');
  await expect(categoryNavRu).toContainText('Собаки');
  await expect(categoryNavRu).toContainText('Здоровье и пищевые добавки');
  await expect(categoryNavRu).toContainText('Роботы-газонокосилки');
  await expect(categoryNavRu).toContainText('Аксессуары для роботов-газонокосилок');

  await page.locator('#language').selectOption('de');
  const categoryNavDe=page.getByRole('navigation',{name:'Produktkategorien'});
  await categoryNavDe.locator('a[data-catalog-category="pet.equestrian"]').click();
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/search\.html\?.*category=pet\.equestrian/);
  await expect(page.locator('#summary')).toContainText('29');
  await expect(page.locator('#cards article.product')).toHaveCount(29);
  await expect(page.locator('#cards')).toContainText('Ahipos');
  expect(errors).toEqual([]);
});

test('large category can reveal every result beyond the previous 100-card ceiling',async({page})=>{
 await page.goto(base+'search.html?category=home.living&lang=de',{waitUntil:'networkidle'});
 await expect(page.locator('#cards article.product')).toHaveCount(516);
 await expect(page.locator('#cards article.product:visible')).toHaveCount(24);
 while(await page.locator('.results-pager-button').isVisible())await page.locator('.results-pager-button').click();
 await expect(page.locator('#cards article.product:visible')).toHaveCount(516);
 await expect(page.locator('.results-pager-status')).toContainText('516 von 516');
});

test('new search loads products outside the previous category',async({page})=>{
 await page.goto(base+'search.html?category=gifts.personalized.jewelry&lang=de',{waitUntil:'networkidle'});
 await page.locator('#query').fill('Mosaiktisch');
 await page.locator('.search-form button[type="submit"]').click();
 await expect(page.locator('#cards')).toContainText('Mosaiktisch');
 await expect(page.locator('#cards')).toContainText('Casa Moro');
 await expect(page).toHaveURL(/q=Mosaiktisch/);
 expect(new URL(page.url()).searchParams.has('category')).toBe(false);
});
