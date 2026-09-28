'use strict';

const fs = require('node:fs');
const path = require('node:path');

const API_ROOT = 'https://www.googleapis.com/webmasters/v3';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SITE_URL = process.env.SEARCH_CONSOLE_SITE_URL || 'sc-domain:fundblick.de';

function required(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function isoDate(d) { return d.toISOString().slice(0, 10); }
function defaultRange(now = new Date()) {
  const end = new Date(now); end.setUTCDate(end.getUTCDate() - 3);
  const start = new Date(end); start.setUTCDate(start.getUTCDate() - 27);
  return { startDate: isoDate(start), endDate: isoDate(end) };
}

async function accessToken() {
  if (String(process.env.SEARCH_CONSOLE_ACCESS_TOKEN || '').trim()) return required('SEARCH_CONSOLE_ACCESS_TOKEN');
  const body = new URLSearchParams({
    client_id: required('SEARCH_CONSOLE_CLIENT_ID'),
    client_secret: required('SEARCH_CONSOLE_CLIENT_SECRET'),
    refresh_token: required('SEARCH_CONSOLE_REFRESH_TOKEN'),
    grant_type: 'refresh_token'
  });
  const response = await fetch(TOKEN_URL, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body });
  if (!response.ok) throw new Error(`Google OAuth token refresh ${response.status}: ${await response.text()}`);
  const data = await response.json();
  if (!data.access_token) throw new Error('Google OAuth response did not contain access_token');
  return data.access_token;
}

async function query(token, body) {
  const url = `${API_ROOT}/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`Search Console API ${response.status}: ${await response.text()}`);
  return response.json();
}

function rows(data) {
  return (data.rows || []).map(r => ({ keys: r.keys || [], clicks: r.clicks || 0, impressions: r.impressions || 0, ctr: r.ctr || 0, position: r.position || 0 }));
}

function summary(dailyRows) {
  const totals = dailyRows.reduce((a, r) => ({ clicks: a.clicks + r.clicks, impressions: a.impressions + r.impressions }), { clicks: 0, impressions: 0 });
  return { ...totals, ctr: totals.impressions ? totals.clicks / totals.impressions : 0 };
}

async function collect() {
  const token = await accessToken();
  const { startDate, endDate } = defaultRange();
  const base = { startDate, endDate, type: 'web', dataState: 'final', rowLimit: 25000 };
  const [daily, queries, pages, devices, countries] = await Promise.all([
    query(token, { ...base, dimensions: ['date'] }),
    query(token, { ...base, dimensions: ['query'], rowLimit: 1000 }),
    query(token, { ...base, dimensions: ['page'], rowLimit: 1000 }),
    query(token, { ...base, dimensions: ['device'] }),
    query(token, { ...base, dimensions: ['country'], rowLimit: 250 })
  ]);
  const dailyRows = rows(daily);
  const report = {
    schemaVersion: 2,
    source: 'google-search-console',
    siteUrl: SITE_URL,
    generatedAt: new Date().toISOString(),
    range: { startDate, endDate },
    summary: summary(dailyRows),
    daily: dailyRows,
    topQueries: rows(queries), topPages: rows(pages), devices: rows(devices), countries: rows(countries),
    caveat: 'Search Console API may return top rows rather than every row for detailed dimensions.'
  };
  const out = process.argv[2] || path.join('build', 'analytics', 'search-console.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
  console.log(`Search Console report written: ${out}`);
}

if (require.main === module) collect().catch(err => { console.error(err.message); process.exitCode = 1; });
module.exports = { defaultRange, rows, summary };
