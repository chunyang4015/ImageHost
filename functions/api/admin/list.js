// GET /api/admin/list
// List all uploaded images from KV
export async function onRequestGet({ request, env }) {
  const authError = verifyAuth(request, env);
  if (authError) return authError;

  try {
    const keys = [];
    let cursor = null;
    // Paginate through all keys with prefix "img:"
    do {
      const list = await env.IMAGE_KV.list({ prefix: 'img:', cursor });
      keys.push(...list.keys);
      cursor = list.list_complete ? null : list.cursor;
    } while (cursor);

    // Bulk get all values
    const images = [];
    for (const key of keys) {
      const value = await env.IMAGE_KV.get(key.name, 'json');
      if (value) images.push(value);
    }
    // Sort by upload time, newest first
    images.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    return new Response(JSON.stringify({ success: true, images, total: images.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, error: '获取列表失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function verifyAuth(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return new Response(JSON.stringify({ success: false, error: '未登录' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    const decoded = atob(token);
    const [timestampStr] = decoded.split('.');
    const timestamp = parseInt(timestampStr, 10);
    // Token expires after 24 hours
    if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
      return new Response(JSON.stringify({ success: false, error: '登录已过期' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return null;
  } catch {
    return new Response(JSON.stringify({ success: false, error: '无效Token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
