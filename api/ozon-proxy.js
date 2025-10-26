// api/ozon-proxy.js


export default async function handler(req, res) {
// 简单健康检查（GET /api/ozon-proxy）
if (req.method === 'GET') {
return res.status(200).json({ ok: true, message: 'Ozon proxy is running.' });
}


if (req.method !== 'POST') {
res.setHeader('Allow', 'GET, POST');
return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
}


const OZON_CLIENT_ID = process.env.OZON_CLIENT_ID;
const OZON_API_KEY = process.env.OZON_API_KEY;
if (!OZON_CLIENT_ID || !OZON_API_KEY) {
return res.status(500).json({ ok: false, error: 'Missing OZON_CLIENT_ID or OZON_API_KEY envs' });
}


const { endpoint } = req.query; // 例如 "/v3/product/import"
let queryString = '';
// 允许前端通过 "?endpoint=/path&..." 追加查询串
const url = new URL(req.url, 'http://localhost');
url.searchParams.forEach((v, k) => {
if (k !== 'endpoint') {
queryString += `${queryString ? '&' : '?'}${k}=${encodeURIComponent(v)}`;
}
});


// 白名单：可按需增减
const allowed = new Set([
'/v2/description-category/tree',
'/v1/description-category/attribute',
'/v3/product/import',
'/v1/product/import-by-sku',
'/v1/product/import/prices',
'/v4/product/info/stocks',
'/v1/analytics/data',
'/v2/finance/realization',
]);


if (!endpoint || !allowed.has(endpoint)) {
return res.status(400).json({ ok: false, error: 'Endpoint not allowed or missing', endpoint });
}


const apiBase = 'https://api-seller.ozon.ru';
const target = apiBase + endpoint + (queryString || '');


try {
const upstream = await fetch(target, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Client-Id': OZON_CLIENT_ID,
'Api-Key': OZON_API_KEY,
},
body: JSON.stringify(req.body || {}),
});


const data = await upstream.json().catch(async () => ({ raw: await upstream.text() }));
// CORS
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
return res.status(upstream.status).json(data);
} catch (err) {
return res.status(500).json({ ok: false, error: err?.message || String(err) });
}
}
