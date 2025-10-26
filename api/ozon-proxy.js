export default async function handler(req, res) {
  // 允许跨域（前端在同一域时也安全）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // 从环境变量读取 Ozon 的 API 凭证
  const clientId = process.env.OZON_CLIENT_ID;
  const apiKey = process.env.OZON_API_KEY;

  // 检查是否配置
  if (!clientId || !apiKey) {
    return res.status(500).json({
      ok: false,
      error: '缺少 OZON_CLIENT_ID 或 OZON_API_KEY 环境变量',
    });
  }

  // 获取 query 中的 endpoint 参数
  const { endpoint = '', ...query } = req.query;
  if (!endpoint.startsWith('/')) {
    return res.status(400).json({
      ok: false,
      error: "endpoint 参数格式错误，应以 '/' 开头",
    });
  }

  // 构建完整 Ozon API URL
  const url = `https://api-seller.ozon.ru${endpoint}`;

  // 处理请求体（POST 时）
  let body = {};
  if (req.method === 'POST') {
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
    } catch (e) {
      return res.status(400).json({
        ok: false,
        error: '请求体 JSON 解析失败: ' + e.message,
      });
    }
  }

  // 如果只是测试代理
  if (endpoint === '' && req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      msg: 'Ozon Proxy 正常运行 ✅',
    });
  }

  try {
    const ozonRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Client-Id': clientId,
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body || {}),
    });

    // 解析返回体
    const text = await ozonRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    // 返回结果
    return res.status(ozonRes.status).json({
      ok: ozonRes.ok,
      status: ozonRes.status,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || '请求 Ozon API 失败',
    });
  }
}
