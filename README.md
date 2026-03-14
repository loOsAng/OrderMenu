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
- `ADMIN_PASSWORD`
- `AUTH_SECRET`

本地开发示例：

```env
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="your-admin-password"
AUTH_SECRET="a-long-random-secret"
```

## 长期使用建议

如果你想让朋友长期直接用手机打开，推荐下面这套：

- 部署平台：`Railway`
- 访问方式：给朋友发主站链接，例如 `https://menu.xxx.app`
- 后台地址：你自己保存 `https://menu.xxx.app/admin/login`

为什么先推荐 `Railway`：

- 这一版默认用 `SQLite`
- 比起 Vercel，它更容易保持一个长期在线的 Node 服务
- 可以挂载持久化卷来保存 `SQLite` 数据文件
- 你后续可以再升级成 Postgres

## Railway 部署步骤

1. 把代码推到 GitHub
2. 在 Railway 新建项目并导入仓库
3. 给项目挂一个持久化卷，比如挂载到 `/data`
4. 配置环境变量：
   `DATABASE_URL=file:/data/dev.db`
   `ADMIN_PASSWORD=你自己的后台密码`
   `AUTH_SECRET=一串足够长的随机字符串`
5. 启动命令设为：`npm start`
6. 部署完成后，把根域名链接发给朋友

说明：

- 现在项目的 `npm start` 已经会先执行 `prisma db push`，所以 Railway 不额外配 pre-deploy 命令也能初始化数据库
- 你只需要把首页链接发给朋友，后台入口自己留着：`/admin/login`

## 后续更稳的升级方向

如果后面订单会越来越多，建议下一步再升级成：

- 数据库：`Neon` 或 `Supabase Postgres`
- 部署：`Vercel`

这样会更适合真正长期在线运行，也更方便后面扩展支付、图片上传、消息提醒。
