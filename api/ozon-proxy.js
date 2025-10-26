// api/ozon-proxy.js
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  // 跨域
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // 健康检查
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, msg: "Ozon Proxy 正常运行 ✅" });
  }

  const clientId = process.env.OZON_CLIENT_ID;
  const apiKey = process.env.OZON_API_KEY;
  if (!clientId || !apiKey) {
    return res
      .status(500)
      .json({ ok: false, error: "缺少 OZON_CLIENT_ID 或 OZON_API_KEY 环境变量" });
  }

  const { endpoint = "" } = req.query || {};
  if (!endpoint || !endpoint.startsWith("/")) {
    return res
      .status(400)
      .json({ ok: false, error: "endpoint 参数格式错误，应以 '/' 开头" });
  }

  const url = `https://api-seller.ozon.ru${endpoint}`;
  const cachePath = path.join("/tmp", "category-tree.json");
  const cacheTTL = 1000 * 60 * 60 * 24; // 24 小时缓存

  // ----------------------------
  // 🧠 缓存逻辑（仅对 /v1/description-category/tree 生效）
  // ----------------------------
  if (endpoint === "/v1/description-category/tree") {
    try {
      if (fs.existsSync(cachePath)) {
        const stat = fs.statSync(cachePath);
        const age = Date.now() - stat.mtimeMs;

        if (age < cacheTTL) {
          const cached = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
          return res
            .status(200)
            .json({ ok: true, fromCache: true, data: cached });
        }
      }
    } catch (err) {
      console.warn("读取缓存失败：", err.message);
    }
  }

  // ----------------------------
  // 🔥 向 Ozon 发送真实请求
  // ----------------------------
  let body = {};
  try {
    body =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : req.body || {};
  } catch (e) {
    return res
      .status(400)
      .json({ ok: false, error: "请求体 JSON 解析失败: " + e.message });
  }

  try {
    const ozonRes = await fetch(url, {
      method: "POST",
      headers: {
        "Client-Id": clientId,
        "Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await ozonRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    // ----------------------------
    // 🧩 若为类目树则写入缓存
    // ----------------------------
    if (endpoint === "/v1/description-category/tree" && ozonRes.ok) {
      try {
        fs.writeFileSync(cachePath, JSON.stringify(data, null, 2), "utf-8");
      } catch (err) {
        console.warn("写入缓存失败：", err.message);
      }
    }

    return res
      .status(ozonRes.status)
      .json({ ok: ozonRes.ok, status: ozonRes.status, data });
  } catch (error) {
    return res
      .status(500)
      .json({ ok: false, error: error.message || "请求 Ozon API 失败" });
  }
}
