export async function onRequest({ request, env }) {
  const formData = await request.formData()
  const imgFile = formData.get('file')
  const body = new FormData()
  body.append('image', imgFile)

  const res = await fetch(`https://api.imgur.com/3/upload?client_id=546c25a59c58ad7`, {
    method: 'POST',
    headers: { Authorization: 'Client-ID 546c25a59c58ad7' },
    body
  })

  const data = await res.json()

  // Save metadata to KV if upload succeeded and KV is available
  if (data.success && env && env.IMAGE_KV) {
    const img = data.data
    await env.IMAGE_KV.put(
      `img:${img.id}`,
      JSON.stringify({
        id: img.id,
        deletehash: img.deletehash,
        link: img.link,
        filename: imgFile.name || 'unknown',
        size: img.size,
        type: img.type,
        uploadedAt: new Date().toISOString()
      })
    )
  }

  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' }
  })
}
