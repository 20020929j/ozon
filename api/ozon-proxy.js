// api/ozon-proxy.js
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 健康检查：GET /api/ozon-proxy
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, msg: 'Ozon Proxy 正常运行 ✅' });
  }

  const clientId = process.env.OZON_CLIENT_ID;
  const apiKey = process.env.OZON_API_KEY;
  if (!clientId || !apiKey) {
    return res.status(500).json({ ok: false, error: '缺少 OZON_CLIENT_ID 或 OZON_API_KEY' });
  }

  const { endpoint = '' } = req.query || {};
  if (!endpoint || !endpoint.startsWith('/')) {
    return res.status(400).json({ ok: false, error: "endpoint 参数格式错误，应以 '/' 开头" });
  }

  const url = `https://api-seller.ozon.ru${endpoint}`;

  let body = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  } catch (e) {
    return res.status(400).json({ ok: false, error: '请求体 JSON 解析失败: ' + e.message });
  }

  try {
    const ozonRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Client-Id': clientId,
        'Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const text = await ozonRes.text();
    let data; try { data = JSON.parse(text); } catch { data = text; }

    return res.status(ozonRes.status).json({ ok: ozonRes.ok, status: ozonRes.status, data });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || '请求 Ozon API 失败' });
  }
}
