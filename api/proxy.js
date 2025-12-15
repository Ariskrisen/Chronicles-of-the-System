export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { apiKey, model, contents, config } = body;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Prepare contents for REST API
    // Google REST API expects: contents: [{ parts: [{ text: "..." }] }]
    // If we receive a simple string, we wrap it.
    let apiContents = contents;
    if (typeof contents === 'string') {
      apiContents = [{ parts: [{ text: contents }] }];
    } else if (typeof contents === 'object' && !Array.isArray(contents) && contents.parts) {
      apiContents = [contents];
    }

    // Construct the payload
    const payload = {
      contents: apiContents,
      generationConfig: config || {}
    };

    // Call Google API directly from the server (Edge)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const googleResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      return new Response(JSON.stringify(data), { 
        status: googleResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Proxy Error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}