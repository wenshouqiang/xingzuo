app.js：入口文件

db.js：数据库连接池

middleware/auth.js：JWT 验证中间件

routes/auth.js：注册/登录

routes/tests.js：获取测试列表、题目、提交答案

routes/reports.js：获取报告、创建支付

routes/webhook.js：Stripe 支付回调

在 backend 文件夹运行：
node app.js
如果看到 Server running on port 3000 表示成功。此时可以用 Postman 或浏览器测试接口（如 GET http://localhost:3000/api/tests）。

4.4 运行前端 在 frontend 文件夹运行：
npm run dev
访问 http://localhost:5173，注册一个账号，然后测试完整流程。