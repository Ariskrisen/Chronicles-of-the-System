export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  
  // Logic: 
  // 1. Client requests: https://your-app.vercel.app/api/proxy/v1beta/models/...
  // 2. We strip '/api/proxy' from the start of the pathname
  // 3. We forward to: https://generativelanguage.googleapis.com/v1beta/models/...
  
  const path = url.pathname.replace(/^\/api\/proxy/, '');
  const targetUrl = `https://generativelanguage.googleapis.com${path}${url.search}`;

  // Prepare headers
  const headers = new Headers();
  // Pass through critical headers. 
  // 'x-goog-api-key' might be in header (if SDK put it there) or query param (handled by url.search)
  const allowedHeaders = ['content-type', 'x-goog-api-client', 'x-goog-api-key', 'accept'];
  
  for (const [key, value] of req.headers.entries()) {
    if (allowedHeaders.includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  }

  const response = await fetch(targetUrl, {
    method: req.method,
    headers: headers,
    // Only pass body if it's a method that supports it
    body: (req.method !== 'GET' && req.method !== 'HEAD') ? req.body : undefined,
  });

  return response;
}