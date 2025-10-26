// ✅ Node Fetch v2 写法
const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  try {
    const { endpoint } = event.queryStringParameters;
    const body = event.body ? JSON.parse(event.body) : null;

    const resp = await fetch('https://api-seller.ozon.ru' + endpoint, {
      method: body ? 'POST' : 'GET',
      headers: {
        'Client-Id': process.env.OZON_CLIENT_ID,
        'Api-Key': process.env.OZON_API_KEY,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await resp.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, data })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message })
    };
  }
};
