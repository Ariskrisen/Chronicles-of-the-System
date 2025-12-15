export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  
  // Clean path: remove /api/proxy prefix
  const path = url.pathname.replace(/^\/api\/proxy/, '');
  // Construct target URL
  const targetUrl = `https://generativelanguage.googleapis.com${path}${url.search}`;

  // Prepare headers
  const headers = new Headers();
  
  // Explicitly copy ONLY safe headers. 
  // Browsers send Origin/Referer/Host which can cause Google API to reject the request with 400/403.
  const allowedHeaders = [
    'content-type', 
    'x-goog-api-client', 
    'x-goog-api-key', 
    'accept',
    'user-agent'
  ];
  
  for (const [key, value] of req.headers.entries()) {
    if (allowedHeaders.includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  }

  // Debug (will show in Vercel logs)
  console.log(`Proxying ${req.method} to: ${targetUrl}`);

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: (req.method !== 'GET' && req.method !== 'HEAD') ? req.body : undefined,
    });

    return response;
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Proxy fetch failed', details: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}