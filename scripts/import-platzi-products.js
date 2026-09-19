const fs = require('fs');

const SOURCE_URL = 'https://api.escuelajs.co/api/v1/products?offset=0&limit=50';
const OUTPUT_FILE = 'products.json';

async function importPlatziProducts() {
  console.log('Broki Platzi-Import gestartet.');

    const response = await fetch(SOURCE_URL);

      if (!response.ok) {
          throw new Error(
                `Platzi API Fehler: ${response.status} ${response.statusText}`
                    );
                      }

                        const data = await response.json();

                          if (!Array.isArray(data)) {
                              throw new Error('Platzi API hat keine gültige Produktliste geliefert.');
                                }

                                  let existingProducts = [];

                                    if (fs.existsSync(OUTPUT_FILE)) {
                                        const existingData = fs.readFileSync(OUTPUT_FILE, 'utf8');
                                            existingProducts = JSON.parse(existingData);

                                                if (!Array.isArray(existingProducts)) {
                                                      throw new Error('products.json enthält keine gültige Produktliste.');
                                                          }
                                                            }

                                                              const today = new Date().toISOString().split('T')[0];

                                                                const importedProducts = data.map(product => ({
                                                                    id: `platzi-${product.id}`,
                                                                        name: product.title || 'Unbenanntes Produkt',
                                                                            category: product.category?.name || 'Sonstiges',
                                                                                brand: '',
                                                                                    description: product.description || '',
                                                                                        image:
                                                                                              Array.isArray(product.images) && product.images.length > 0
                                                                                                      ? product.images[0]
                                                                                                              : '',
                                                                                                                  merchant: 'Platzi Fake Store Testquelle',
                                                                                                                      price: Number(product.price) || 0,
                                                                                                                          currency: 'EUR',
                                                                                                                              originalPrice: null,
                                                                                                                                  affiliateUrl: '',
                                                                                                                                      active: true,
                                                                                                                                          lastUpdated: today
                                                                                                                                            }));

                                                                                                                                              const importedIds = new Set(
                                                                                                                                                  importedProducts.map(product => String(product.id))
                                                                                                                                                    );

                                                                                                                                                      const existingPlatziProducts = existingProducts.filter(product =>
                                                                                                                                                          String(product.id || '').startsWith('platzi-')
                                                                                                                                                            );

                                                                                                                                                              const deactivatedProducts = existingPlatziProducts
                                                                                                                                                                  .filter(product => !importedIds.has(String(product.id)))
                                                                                                                                                                      .map(product => ({
                                                                                                                                                                            ...product,
                                                                                                                                                                                  active: false,
                                                                                                                                                                                        lastUpdated: today
                                                                                                                                                                                            }));

                                                                                                                                                                                              const nonPlatziProducts = existingProducts.filter(
                                                                                                                                                                                                  product => !String(product.id || '').startsWith('platzi-')
                                                                                                                                                                                                    );

                                                                                                                                                                                                      const existingPlatziIds = new Set(
                                                                                                                                                                                                          existingPlatziProducts.map(product => String(product.id))
                                                                                                                                                                                                            );

                                                                                                                                                                                                              const newProducts = importedProducts.filter(
                                                                                                                                                                                                                  product => !existingPlatziIds.has(String(product.id))
                                                                                                                                                                                                                    );

                                                                                                                                                                                                                      const updatedProducts = importedProducts.filter(
                                                                                                                                                                                                                          product => existingPlatziIds.has(String(product.id))
                                                                                                                                                                                                                            );

                                                                                                                                                                                                                              const finalProducts = [
                                                                                                                                                                                                                                  ...nonPlatziProducts,
                                                                                                                                                                                                                                      ...importedProducts,
                                                                                                                                                                                                                                          ...deactivatedProducts
                                                                                                                                                                                                                                            ];

                                                                                                                                                                                                                                              fs.writeFileSync(
                                                                                                                                                                                                                                                  OUTPUT_FILE,
                                                                                                                                                                                                                                                      JSON.stringify(finalProducts, null, 2),
                                                                                                                                                                                                                                                          'utf8'
                                                                                                                                                                                                                                                            );

                                                                                                                                                                                                                                                              console.log('Broki Platzi-Import erfolgreich.');
                                                                                                                                                                                                                                                                console.log(`Quelle: ${SOURCE_URL}`);
                                                                                                                                                                                                                                                                  console.log(`Von Platzi geladen: ${importedProducts.length}`);
                                                                                                                                                                                                                                                                    console.log(`Neue Produkte: ${newProducts.length}`);
                                                                                                                                                                                                                                                                      console.log(`Aktualisierte Produkte: ${updatedProducts.length}`);
                                                                                                                                                                                                                                                                        console.log(`Deaktivierte Platzi-Produkte: ${deactivatedProducts.length}`);
                                                                                                                                                                                                                                                                          console.log(`Produkte insgesamt in products.json: ${finalProducts.length}`);
                                                                                                                                                                                                                                                                          }

                                                                                                                                                                                                                                                                          importPlatziProducts().catch(error => {
                                                                                                                                                                                                                                                                            console.error('Broki Platzi-Import fehlgeschlagen.');
                                                                                                                                                                                                                                                                              console.error(error);
                                                                                                                                                                                                                                                                                process.exit(1);
                                                                                                                                                                                                                                                                                });
