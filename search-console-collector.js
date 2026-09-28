'use strict';

const fs = require('node:fs');
const path = require('node:path');

const API_ROOT = 'https://searchconsole.googleapis.com/webmasters/v3';
const SITE_URL = process.env.SEARCH_CONSOLE_SITE_URL || 'sc-domain:fundblick.de';

function required(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function isoDate(d) { return d.toISOString().slice(0, 10); }
function defaultRange() {
  const end = new Date(); end.setUTCDate(end.getUTCDate() - 3);
  const start = new Date(end); start.setUTCDate(start.getUTCDate() - 27);
  return { startDate: isoDate(start), endDate: isoDate(end) };
}

async function query(accessToken, body) {
  const url = `${API_ROOT}/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`Search Console API ${response.status}: ${await response.text()}`);
  return response.json();
}

function rows(data) {
  return (data.rows || []).map(r => ({ keys: r.keys || [], clicks: r.clicks || 0, impressions: r.impressions || 0, ctr: r.ctr || 0, position: r.position || 0 }));
}

async function collect() {
  const accessToken = required('SEARCH_CONSOLE_ACCESS_TOKEN');
  const { startDate, endDate } = defaultRange();
  const base = { startDate, endDate, type: 'web', dataState: 'final', rowLimit: 25000 };
  const [daily, queries, pages, devices, countries] = await Promise.all([
    query(accessToken, { ...base, dimensions: ['date'] }),
    query(accessToken, { ...base, dimensions: ['query'], rowLimit: 1000 }),
    query(accessToken, { ...base, dimensions: ['page'], rowLimit: 1000 }),
    query(accessToken, { ...base, dimensions: ['device'] }),
    query(accessToken, { ...base, dimensions: ['country'], rowLimit: 250 })
  ]);
  const report = {
    schemaVersion: 1,
    source: 'google-search-console',
    siteUrl: SITE_URL,
    generatedAt: new Date().toISOString(),
    range: { startDate, endDate },
    daily: rows(daily), topQueries: rows(queries), topPages: rows(pages), devices: rows(devices), countries: rows(countries)
  };
  const out = process.argv[2] || path.join('build', 'analytics', 'search-console.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
  console.log(`Search Console report written: ${out}`);
}

if (require.main === module) collect().catch(err => { console.error(err.message); process.exitCode = 1; });
module.exports = { defaultRange, rows };
