// POST /api/admin/login
// Verify password and return HMAC-signed token
export async function onRequestPost({ request, env }) {
  const ADMIN_PASSWORD = env.ADMIN_PASSWORD || 'admin123';
  try {
    const { password } = await request.json();
    if (password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ success: false, error: '密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // Generate token: base64(timestamp.hmac)
    const timestamp = Date.now();
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(ADMIN_PASSWORD), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(String(timestamp)));
    const token = btoa(
      `${timestamp}.${Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')}`,
    );
    return new Response(JSON.stringify({ success: true, token }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, error: '请求格式错误' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
