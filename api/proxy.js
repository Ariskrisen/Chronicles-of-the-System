export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  
  // Определяем целевой URL: убираем /api/proxy и подставляем хост Google API
  const targetHost = 'generativelanguage.googleapis.com';
  const targetPath = url.pathname.replace(/^\/api\/proxy/, '');
  const targetUrl = new URL(targetPath, `https://${targetHost}`);

  // Копируем параметры запроса (например, ?key=...)
  url.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  // Обработка Preflight запросов (CORS OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*', // Разрешаем любые заголовки, которые шлет SDK
      },
    });
  }

  // Подготовка заголовков для пересылки
  const headers = new Headers();
  for (const [key, value] of req.headers.entries()) {
    // Пропускаем системные заголовки, которые могут конфликтовать или указывать на прокси
    if (!['host', 'connection', 'transfer-encoding', 'content-length', 'content-encoding'].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  }

  try {
    const response = await fetch(targetUrl.toString(), {
      method: req.method,
      headers: headers,
      body: req.body,
      redirect: 'follow', // Следуем за редиректами если есть
    });

    // Подготовка заголовков ответа для клиента
    const resHeaders = new Headers(response.headers);
    resHeaders.set('Access-Control-Allow-Origin', '*');
    
    // Удаляем заголовки сжатия, чтобы браузер не пытался разжать то, что уже могло быть обработано
    resHeaders.delete('content-encoding');
    resHeaders.delete('content-length');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
    });
  } catch (error) {
    console.error('Proxy Error:', error);
    return new Response(JSON.stringify({ error: 'Proxy Request Failed', details: error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }
}