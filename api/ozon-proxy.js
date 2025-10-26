// api/ozon-proxy.js
export default async function handler(req, res) {
  // 从环境变量读取密钥
  const clientId = process.env.OZON_CLIENT_ID;
  const apiKey = process.env.OZON_API_KEY;

  // 检查是否设置了环境变量
  if (!clientId || !apiKey) {
    return res.status(500).json({
      ok: false,
      error: "缺少 OZON_CLIENT_ID 或 OZON_API_KEY 环境变量",
    });
  }

  // 获取 endpoint 参数
  const { endpoint } = req.query;

  if (!endpoint || !endpoint.startsWith("/")) {
    return res.status(400).json({
      ok: false,
      error: "endpoint 参数格式错误，应以 / 开头",
    });
  }

  // 构造完整 URL
  const url = `https://api-seller.ozon.ru${endpoint}`;

  try {
    // 发送请求到 Ozon API
    const apiRes = await fetch(url, {
      method: "POST",
      headers: {
        "Client-Id": clientId,
        "Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body || {}),
    });

    const data = await apiRes.json();

    res.status(apiRes.status).json({
      ok: apiRes.ok,
      status: apiRes.status,
      data,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message || "代理请求失败",
    });
  }
}
