const fs = require('fs');

const SOURCE_URL = 'https://dummyjson.com/products?limit=50';

async function importProducts() {
  console.log('Broki startet Produktimport ...');

  const response = await fetch(SOURCE_URL);

  if (!response.ok) {
    throw new Error(
      `DummyJSON konnte nicht geladen werden: ${response.status}`
    );
  }

  const data = await response.json();

  if (!Array.isArray(data.products)) {
    throw new Error('DummyJSON hat keine gültige Produktliste geliefert.');
  }

  const products = data.products.map(product => ({
    id: `dummyjson-${product.id}`,
    name: product.title,
    category: product.category,
    brand: product.brand || '',
    description: product.description,
    image: product.thumbnail || '',
    merchant: 'DummyJSON Testquelle',
    price: Number(product.price),
    currency: 'EUR',
    originalPrice: null,
    affiliateUrl: '',
    lastUpdated: new Date().toISOString().slice(0, 10)
  }));

  fs.writeFileSync(
    'products.json',
    JSON.stringify(products, null, 2) + '\n',
    'utf8'
  );

  console.log(`${products.length} Produkte erfolgreich importiert.`);
}

importProducts().catch(error => {
  console.error('Broki-Import fehlgeschlagen:', error);
  process.exit(1);
});
