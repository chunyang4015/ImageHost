<template>
  <section class="Admin">
    <!-- Login -->
    <div v-if="!token" class="login">
      <h2>管理后台</h2>
      <form @submit.prevent="handleLogin">
        <input v-model="password" type="password" placeholder="输入管理密码" autocomplete="current-password" />
        <Button type="submit" :disabled="loading">{{ loading ? '登录中...' : '登录' }}</Button>
      </form>
      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <!-- Dashboard -->
    <div v-else class="dashboard">
      <div class="dashboard-header">
        <h2>图片管理 <span class="count">{{ images.length }} 张</span></h2>
        <div class="actions">
          <Button variant="outline" size="sm" @click="loadImages">刷新</Button>
          <Button variant="ghost" size="sm" @click="handleLogout">退出</Button>
        </div>
      </div>

      <div v-if="loadingImages" class="empty">加载中...</div>
      <div v-else-if="!images.length" class="empty">暂无图片</div>
      <div v-else class="grid">
        <div class="card" v-for="img in images" :key="img.id">
          <div class="thumb-wrap">
            <img :src="img.link" :alt="img.filename" loading="lazy" />
          </div>
          <div class="info">
            <span class="name" :title="img.filename">{{ img.filename }}</span>
            <span class="meta">{{ formatSize(img.size) }} · {{ formatDate(img.uploadedAt) }}</span>
          </div>
          <Button variant="destructive" size="xs" @click="handleDelete(img.id)">删除</Button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { adminLogin, fetchImages, deleteImage } from '@/utils/api'
import type { ImageItem } from '@/utils/api'

const token = ref<string>(sessionStorage.getItem('admin_token') || '')
const password = ref('')
const loading = ref(false)
const loadingImages = ref(false)
const error = ref('')
const images = ref<ImageItem[]>([])

onMounted(() => {
  if (token.value) loadImages()
})

async function handleLogin() {
  if (!password.value) return
  loading.value = true
  error.value = ''
  try {
    token.value = await adminLogin(password.value)
    sessionStorage.setItem('admin_token', token.value)
    await loadImages()
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '登录失败'
  } finally {
    loading.value = false
  }
}

function handleLogout() {
  token.value = ''
  sessionStorage.removeItem('admin_token')
  images.value = []
}

async function loadImages() {
  loadingImages.value = true
  try {
    const res = await fetchImages(token.value)
    images.value = res.images
  } catch {
    handleLogout()
  } finally {
    loadingImages.value = false
  }
}

async function handleDelete(id: string) {
  if (!confirm('确定删除这张图片？')) return
  try {
    const res = await deleteImage(token.value, id)
    if (res.success) {
      images.value = images.value.filter(img => img.id !== id)
    }
  } catch {
    // ignore
  }
}

function formatSize(bytes: number): string {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatDate(iso: string): string {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}
</script>

<style scoped lang="less">
.Admin {
  padding-top: 1rem;

  .login {
    max-width: 320px;
    margin: 4rem auto 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;

    h2 {
      font-size: 1.1rem;
      font-weight: 600;
    }

    form {
      width: 100%;
      display: flex;
      gap: 0.5rem;

      input {
        flex: 1;
        padding: 0.5rem 0.75rem;
        border: 1px solid #e2e8f0;
        border-radius: 0.375rem;
        font-size: 14px;
        outline: none;
        transition: border-color 0.15s;

        &:focus {
          border-color: #94a3b8;
        }
      }
    }

    .error {
      font-size: 13px;
      color: #ef4444;
    }
  }

  .dashboard {
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;

      h2 {
        font-size: 1rem;
        font-weight: 600;

        .count {
          font-weight: 400;
          color: #94a3b8;
          font-size: 0.85rem;
        }
      }

      .actions {
        display: flex;
        gap: 0.5rem;
      }
    }

    .empty {
      text-align: center;
      color: #94a3b8;
      padding: 3rem 0;
      font-size: 14px;
    }

    .grid {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem;
      border: 1px solid #f1f5f9;
      border-radius: 0.5rem;
      background: #fff;

      .thumb-wrap {
        flex-shrink: 0;
        width: 2.8rem;
        height: 2.8rem;
        border-radius: 0.375rem;
        overflow: hidden;
        background: #f8fafc;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.15rem;

        .name {
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .meta {
          font-size: 11px;
          color: #94a3b8;
        }
      }
    }
  }
}
</style>
