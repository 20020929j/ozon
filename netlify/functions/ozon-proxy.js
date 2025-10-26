import fetch from "node-fetch";

export const handler = async (event) => {
  try {
    const { endpoint } = event.queryStringParameters;
    const body = event.body ? JSON.parse(event.body) : null;

    if (!endpoint) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: "Missing endpoint" })
      };
    }

    const response = await fetch("https://api-seller.ozon.ru" + endpoint, {
      method: body ? "POST" : "GET",
      headers: {
        "Client-Id": process.env.OZON_CLIENT_ID,
        "Api-Key": process.env.OZON_API_KEY,
        "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, data })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: error.message })
    };
  }
};
