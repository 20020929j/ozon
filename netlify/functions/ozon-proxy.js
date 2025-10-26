export async function handler(event) {
  const { endpoint } = event.queryStringParameters;
  const body = event.body ? JSON.parse(event.body) : null;

  const clientId = process.env.OZON_CLIENT_ID;
  const apiKey = process.env.OZON_API_KEY;

  if (!clientId || !apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: "缺少 OZON_CLIENT_ID 或 OZON_API_KEY 环境变量",
      }),
    };
  }

  try {
    const res = await fetch(`https://api-seller.ozon.ru${endpoint}`, {
      method: "POST",
      headers: {
        "Client-Id": clientId,
        "Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : "{}",
    });

    const data = await res.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, data }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: `请求 Ozon API 出错: ${err.message}`,
      }),
    };
  }
}
