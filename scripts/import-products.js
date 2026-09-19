const fs = require('fs');

const SOURCE_URL = 'https://dummyjson.com/products?limit=100';
const OUTPUT_FILE = 'products.json';

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

                                  let existingProducts = [];

                                    if (fs.existsSync(OUTPUT_FILE)) {
                                        try {
                                              existingProducts = JSON.parse(
                                                      fs.readFileSync(OUTPUT_FILE, 'utf8')
                                                            );
                                                                } catch (error) {
                                                                      console.warn(
                                                                              'Bestehende products.json konnte nicht gelesen werden.'
                                                                                    );
                                                                                        }
                                                                                          }

                                                                                            const existingMap = new Map(
                                                                                                existingProducts.map(product => [product.id, product])
                                                                                                  );

                                                                                                    const today = new Date().toISOString().slice(0, 10);

                                                                                                      let added = 0;
                                                                                                        let updated = 0;
                                                                                                          let unchanged = 0;

                                                                                                            const importedProducts = data.products.map(product => {
                                                                                                                const id = `dummyjson-${product.id}`;
                                                                                                                    const existing = existingMap.get(id);

                                                                                                                        const normalized = {
                                                                                                                              id,
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
                                                                                                                                                                                                active: true,
                                                                                                                                                                                                      lastUpdated: today
                                                                                                                                                                                                          };

                                                                                                                                                                                                              if (!existing) {
                                                                                                                                                                                                                    added++;
                                                                                                                                                                                                                          return normalized;
                                                                                                                                                                                                                              }

                                                                                                                                                                                                                                  const changed =
                                                                                                                                                                                                                                        existing.name !== normalized.name ||
                                                                                                                                                                                                                                              existing.category !== normalized.category ||
                                                                                                                                                                                                                                                    existing.brand !== normalized.brand ||
                                                                                                                                                                                                                                                          existing.description !== normalized.description ||
                                                                                                                                                                                                                                                                existing.image !== normalized.image ||
                                                                                                                                                                                                                                                                      existing.merchant !== normalized.merchant ||
                                                                                                                                                                                                                                                                            Number(existing.price) !== normalized.price ||
                                                                                                                                                                                                                                                                                  existing.currency !== normalized.currency ||
                                                                                                                                                                                                                                                                                        existing.active !== true;

                                                                                                                                                                                                                                                                                            if (changed) {
                                                                                                                                                                                                                                                                                                  updated++;
                                                                                                                                                                                                                                                                                                        return normalized;
                                                                                                                                                                                                                                                                                                            }

                                                                                                                                                                                                                                                                                                                unchanged++;

                                                                                                                                                                                                                                                                                                                    return {
                                                                                                                                                                                                                                                                                                                          ...existing,
                                                                                                                                                                                                                                                                                                                                active: true
                                                                                                                                                                                                                                                                                                                                    };
                                                                                                                                                                                                                                                                                                                                      });

                                                                                                                                                                                                                                                                                                                                        const importedIds = new Set(
                                                                                                                                                                                                                                                                                                                                            importedProducts.map(product => product.id)
                                                                                                                                                                                                                                                                                                                                              );

                                                                                                                                                                                                                                                                                                                                                let deactivated = 0;

                                                                                                                                                                                                                                                                                                                                                  const missingProducts = existingProducts
                                                                                                                                                                                                                                                                                                                                                      .filter(product =>
                                                                                                                                                                                                                                                                                                                                                            product.id.startsWith('dummyjson-') &&
                                                                                                                                                                                                                                                                                                                                                                  !importedIds.has(product.id)
                                                                                                                                                                                                                                                                                                                                                                      )
                                                                                                                                                                                                                                                                                                                                                                          .map(product => {
                                                                                                                                                                                                                                                                                                                                                                                if (product.active !== false
