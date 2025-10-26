// ✅ Node Fetch v2 写法（适用于 Netlify Functions）
const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  try {
    const { endpoint } = event.queryStringParameters || {};
    const body = event.body ? JSON.parse(event.body) : null;

    if (!endpoint) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: 'Missing endpoint' })
      };
    }

    const resp = await fetch('https://api-seller.ozon.ru' + endpoint, {
      method: body ? 'POST' : 'GET',
      headers: {
        'Client-Id': process.env.OZON_CLIENT_ID,
        'Api-Key': process.env.OZON_API_KEY,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    // 如果 Ozon API 返回非 200，要单独处理
    const data = await resp.json();
    return {
      statusCode: resp.status,
      body: JSON.stringify({ ok: true, data })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message })
    };
  }
};
