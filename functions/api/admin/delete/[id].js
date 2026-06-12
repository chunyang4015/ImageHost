// DELETE /api/admin/delete/:id
// Delete image from Imgur and KV
export async function onRequestDelete({ request, env, params }) {
  const authError = verifyAuth(request, env);
  if (authError) return authError;

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ success: false, error: '缺少图片ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get metadata from KV
    const meta = await env.IMAGE_KV.get(`img:${id}`, 'json');
    if (!meta) {
      return new Response(JSON.stringify({ success: false, error: '图片不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // Delete from Imgur using deletehash
    if (meta.deletehash) {
      await fetch(`https://api.imgur.com/3/image/${meta.deletehash}`, {
        method: 'DELETE',
        headers: { Authorization: 'Client-ID 546c25a59c58ad7' },
      });
    }
    // Delete from KV
    await env.IMAGE_KV.delete(`img:${id}`);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, error: '删除失败' }), {
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
