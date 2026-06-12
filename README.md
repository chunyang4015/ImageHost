# ImageHost

基于 Cloudflare Pages + Imgur API 的简约图床，支持图片上传和管理。

## 功能

- 图片上传至 Imgur，通过 Cloudflare CDN 加速访问
- 上传历史记录（localStorage 存储）
- 管理后台（`/admin`），查看所有已上传图片，支持删除和复制链接
- 无需服务器，托管在 Cloudflare Pages

## 部署

### 1. Fork 或克隆本项目

```bash
git clone git@github.com:chunyang4015/ImageHost.git
```

### 2. Cloudflare Pages 创建项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. **Workers 和 Pages** → **创建** → **Pages** → **连接到 Git**
3. 选择你的 GitHub 仓库
4. 构建设置：
   - 框架预设：`Vue`
   - 构建命令：`pnpm build-only`
   - 输出目录：`dist`
5. 点击 **保存并部署**

### 3. 配置 KV 命名空间

管理后台依赖 Cloudflare KV 存储图片元数据。

1. 左侧菜单 → **存储和数据库** → **Workers KV**
2. 创建命名空间，名称：`IMAGE_KV`
3. 进入你的 Pages 项目 → **设置** → **函数**
4. **KV 命名空间绑定** → 添加绑定：
   - 变量名称：`IMAGE_KV`
   - KV 命名空间：选择刚创建的 `IMAGE_KV`
5. 保存

### 4. 配置管理密码

1. Pages 项目 → **设置** → **环境变量**
2. 添加变量：
   - 名称：`ADMIN_PASSWORD`
   - 值：你的管理密码
   - 选择 **加密**
3. 保存后重新部署

## 本地开发

```bash
# 安装依赖
pnpm install

# 构建前端
pnpm build-only

# 启动本地开发服务器（需要先构建）
npx wrangler pages dev dist --port 3001 --kv IMAGE_KV
```

访问 `http://localhost:3001` 查看首页，`http://localhost:3001/admin` 查看管理后台。

> 注意：本地环境无法访问 Imgur API（网络限制），上传功能仅在 Cloudflare 线上环境可用。

## 项目结构

```
├── functions/              # Cloudflare Pages Functions（后端 API）
│   ├── upload.js           # 图片上传（转发到 Imgur + 写入 KV）
│   └── api/admin/
│       ├── login.js        # 管理员登录
│       ├── list.js         # 获取图片列表
│       └── delete/[id].js  # 删除图片
├── src/
│   ├── views/
│   │   ├── Home/           # 上传页面
│   │   └── Admin/          # 管理后台
│   ├── components/         # UI 组件
│   ├── utils/
│   │   ├── api.ts          # 管理 API 调用
│   │   └── index.ts        # 工具函数
│   └── router/             # 路由配置
├── package.json
└── vite.config.ts
```

## 待办

- [ ] 从 Imgur 迁移到 Cloudflare R2 对象存储，实现完全自控的图片存储
