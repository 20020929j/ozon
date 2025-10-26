export default async function handler(req, res) {
  // 允许 GET 用于测试
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, msg: "Ozon Proxy 正常运行 ✅" });
  }

  // 检查环境变量
  const clientId = process.env.OZON_CLIENT_ID;
  const apiKey = process.env.OZON_API_KEY;
  if (!clientId || !apiKey) {
    return res.status(500).json({ ok: false, error: "缺少 OZON_CLIENT_ID 或 OZON_API_KEY 环境变量" });
  }

  try {
    const { endpoint = "", body = {} } = req.body || {};
    if (!endpoint.startsWith("/")) {
      return res.status(400).json({ ok: false, error: "endpoint 参数格式错误，应以 / 开头" });
    }

    const url = `https://api-seller.ozon.ru${endpoint}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Client-Id": clientId,
        "Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json({
      ok: response.ok,
      status: response.status,
      data,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message || "未知错误",
    });
  }
}
