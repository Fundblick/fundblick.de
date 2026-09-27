'use strict';
const fs=require('fs');
const assert=require('assert');

const html=fs.readFileSync('search.html','utf8');
const js=fs.readFileSync('amazon-compliance-ui.js','utf8');
const css=fs.readFileSync('external-search.css','utf8');

assert(html.includes('amazon-compliance-ui.js'),'Amazon compliance UI must be loaded');
assert(js.includes('amazon-creators-api'),'Amazon provider selector missing');
assert(js.includes('Als Amazon-Partner verdiene ich an qualifizierten Verkäufen.'),'Amazon partner-status disclosure missing');
assert(js.includes('Preis kann seit der letzten Aktualisierung gestiegen sein')||js.includes('Preis kann seit der letzten Aktualisierung gestiegen'),'Amazon price-change notice missing');
assert(js.includes('Maßgeblich ist der Preis auf Amazon.de zum Zeitpunkt des Kaufs.'),'Amazon purchase-time price notice missing');
assert(js.includes('Bestimmte auf dieser Website angezeigte Inhalte stammen von Amazon.'),'Amazon content-source notice missing');
assert(js.includes("timeZone:'Europe/Berlin'"),'Amazon freshness timestamp must use Europe/Berlin');
assert(js.includes('amazon-price-notice'),'Amazon per-price freshness note missing');
assert(css.includes('.amazon-disclosure'),'Amazon disclosure styling missing');
assert(css.includes('.amazon-price-notice'),'Amazon price notice styling missing');

console.log('Amazon compliance UI static gate: OK');
