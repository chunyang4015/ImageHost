const API_BASE = import.meta.env.VITE_IMG_API_URL || location.origin;

interface ImageItem {
  id: string;
  deletehash: string;
  link: string;
  filename: string;
  size: number;
  type: string;
  uploadedAt: string;
}

interface ListResponse {
  success: boolean;
  images: ImageItem[];
  total: number;
}

interface ApiResponse {
  success: boolean;
  token?: string;
  error?: string;
}

// Login
async function adminLogin(password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data: ApiResponse = await res.json();
  if (!data.success) throw new Error(data.error || '登录失败');
  return data.token!;
}

// Fetch image list
async function fetchImages(token: string): Promise<ListResponse> {
  const res = await fetch(`${API_BASE}/api/admin/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new Error('登录已过期');
  return res.json();
}

// Delete image
async function deleteImage(token: string, id: string): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}/api/admin/delete/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export { adminLogin, fetchImages, deleteImage };
export type { ImageItem };
