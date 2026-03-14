# Home Kitchen Menu

一个给朋友用的手机点单页面，加一个只给你自己的后台管理页面。

## 当前结构

- 顾客点单页：`/`
- 下单页：`/checkout`
- 订单状态页：`/orders/[id]`
- 后台登录页：`/admin/login`
- 后台管理页：`/admin`

顾客端不会再显示后台入口，你只需要把首页链接发给她。

## 本地启动

1. 在项目根目录创建 `.env`，变量内容可以参考 `sample.env`
2. 安装依赖：`npm install`
3. 同步数据库：`npm run db:push`
4. 启动开发环境：`npm run dev`

## 必填环境变量

- `DATABASE_URL`
- `DIRECT_URL`
- `ADMIN_PASSWORD`
- `AUTH_SECRET`

本地开发示例：

```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-example-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://USER:PASSWORD@ep-example.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
ADMIN_PASSWORD="your-admin-password"
AUTH_SECRET="a-long-random-secret"
```

## 长期使用建议

如果你想让朋友长期直接用手机打开，推荐下面这套：

- 部署平台：`Railway`
- 数据库：`Neon Postgres`
- 访问方式：给朋友发主站链接，例如 `https://menu.xxx.app`
- 后台地址：你自己保存 `https://menu.xxx.app/admin/login`

为什么先推荐 `Railway`：

- 比起 Vercel，它更容易保持一个长期在线的 Node 服务
- 配合 `Neon` 不需要依赖本地卷保存数据
- 代码更新后，菜品和订单不会因为重新部署丢失

## Neon + Railway 部署步骤

1. 把代码推到 GitHub
2. 在 [Neon](https://neon.tech/) 新建一个 Postgres 数据库
3. 在 Neon 里复制两个连接串：
   `DATABASE_URL`: 用 pooled connection string
   `DIRECT_URL`: 用 direct connection string
4. 在 Railway 新建项目并导入仓库
5. 在 Railway 的服务变量里配置：
   `DATABASE_URL=你的 Neon pooled 连接串`
   `DIRECT_URL=你的 Neon direct 连接串`
   `ADMIN_PASSWORD=你自己的后台密码`
   `AUTH_SECRET=一串足够长的随机字符串`
6. 启动命令设为：`npm start`
7. 部署完成后，把根域名链接发给朋友

说明：

- 现在项目的 `npm start` 已经会先执行 `prisma db push`，所以 Railway 第一次启动时会自动建表
- `DATABASE_URL` 建议用 Neon 的 pooler 连接串，`DIRECT_URL` 用 direct 连接串
- 你只需要把首页链接发给朋友，后台入口自己留着：`/admin/login`

## 后续可选升级

如果后面订单会越来越多，后面可以再考虑：

- 部署：`Vercel`
- 文件存储：图片上传到 `Cloudinary` 或 `Supabase Storage`

这样会更适合后面扩展图片上传、支付、消息提醒。
