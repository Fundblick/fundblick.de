const fs = require('fs');

const SOURCE_URL = 'https://dummyjson.com/products?limit=90';
const OUTPUT_FILE = 'products.json';

async function importProducts() {
  console.log('Broki startet Produktimport ...');

  const response = await fetch(SOURCE_URL);

  if (!response.ok) {
    throw new Error(
      `DummyJSON konnte nicht geladen werden: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (!Array.isArray(data.products)) {
    throw new Error('DummyJSON hat keine gültige Produktliste geliefert.');
  }

  let existingProducts = [];

  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      existingProducts = JSON.parse(
        fs.readFileSync(OUTPUT_FILE, 'utf8')
      );
    } catch (error) {
      console.log('Bestehende products.json konnte nicht gelesen werden.');
      existingProducts = [];
    }
  }

  const existingById = new Map(
    existingProducts.map(product => [product.id, product])
  );

  const importedIds = new Set();
  const today = new Date().toISOString().slice(0, 10);

  let added = 0;
  let updated = 0;

  const importedProducts = data.products.map(product => {
    const id = `dummyjson-${product.id}`;
    importedIds.add(id);

    const oldProduct = existingById.get(id);

    const newProduct = {
      id: id,
      name: product.title || '',
      category: product.category || '',
      brand: product.brand || '',
      description: product.description || '',
      image: product.thumbnail || '',
      merchant: 'DummyJSON Testquelle',
      price: Number(product.price) || 0,
      currency: 'EUR',
      originalPrice: null,
      affiliateUrl: '',
      active: true,
      lastUpdated: today
    };

    if (!oldProduct) {
      added++;
    } else {
      updated++;
    }

    return newProduct;
  });

  const deactivatedProducts = existingProducts
    .filter(product =>
      String(product.id).startsWith('dummyjson-') &&
      !importedIds.has(product.id)
    )
    .map(product => ({
      ...product,
      active: false,
      lastUpdated: today
    }));

  const nonDummyProducts = existingProducts.filter(
    product => !String(product.id).startsWith('dummyjson-')
  );

  const finalProducts = [
    ...nonDummyProducts,
    ...importedProducts,
    ...deactivatedProducts
  ];

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(finalProducts, null, 2) + '\n',
    'utf8'
  );

  console.log('Broki Produktimport erfolgreich.');
  console.log(`Quelle: ${SOURCE_URL}`);
  console.log(`Von DummyJSON geladen: ${data.products.length}`);
  console.log(`Neue Produkte: ${added}`);
  console.log(`Aktualisierte Produkte: ${updated}`);
  console.log(`Deaktivierte Produkte: ${deactivatedProducts.length}`);
  console.log(`Produkte insgesamt in products.json: ${finalProducts.length}`);
}

importProducts().catch(error => {
  console.error('Broki-Import fehlgeschlagen:');
  console.error(error);
  process.exit(1);
});