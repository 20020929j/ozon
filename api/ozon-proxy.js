// api/ozon-proxy.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const { endpoint } = req.query;
    if (!endpoint) {
      return res.status(400).json({
        ok: false,
        error: "endpoint 参数格式错误，应以 '/' 开头"
      });
    }

    const OZON_CLIENT_ID = process.env.OZON_CLIENT_ID;
    const OZON_API_KEY = process.env.OZON_API_KEY;

    if (!OZON_CLIENT_ID || !OZON_API_KEY) {
      return res.status(500).json({
        ok: false,
        error: '缺少 OZON_CLIENT_ID 或 OZON_API_KEY 环境变量'
      });
    }

    const url = `https://api-seller.ozon.ru${endpoint}`;
    const data = req.body ? JSON.parse(req.body) : {};

    const ozonRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Client-Id': OZON_CLIENT_ID,
        'Api-Key': OZON_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await ozonRes.json();
    res.status(ozonRes.status).json({
      ok: ozonRes.ok,
      status: ozonRes.status,
      data: result
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
