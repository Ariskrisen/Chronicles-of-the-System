export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  
  // Logic: 
  // 1. Client requests: https://your-app.vercel.app/api/proxy/v1beta/models/...
  // 2. We strip '/api/proxy'
  // 3. We forward to: https://generativelanguage.googleapis.com/v1beta/models/...
  
  const path = url.pathname.replace('/api/proxy', '');
  const targetUrl = `https://generativelanguage.googleapis.com${path}${url.search}`;

  const response = await fetch(targetUrl, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      // Forward the API Key header if present (though SDK usually uses query params)
      ...(req.headers.get('x-goog-api-key') && { 'x-goog-api-key': req.headers.get('x-goog-api-key') })
    },
    body: req.body,
  });

  return response;
}