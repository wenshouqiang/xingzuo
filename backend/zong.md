app.js：入口文件

db.js：数据库连接池

middleware/auth.js：JWT 验证中间件

routes/auth.js：注册/登录

routes/tests.js：获取测试列表、题目、提交答案

routes/reports.js：获取报告、创建支付

routes/webhook.js：Stripe 支付回调

在 backend 文件夹运行：
node app.js
如果看到 Server running on port 3000 表示成功。此时可以用 Postman 或浏览器测试接口（如 GET <http://localhost:3000/api/tests）。>

4.4 运行前端 在 frontend 文件夹运行：
npm run dev
访问 <http://localhost:5173，注册一个账号，然后测试完整流程。>

<br />

<br />

<br />

后端工作人员接口：http\://localhost:3000/admin.html

## **五、注意事项**

- 该管理页面**没有任何额外的身份验证**，只有密码保护，请确保密码足够复杂，不要泄露。
- 如果您的后端部署在公网上，强烈建议加上 IP 白名单或使用 `.htaccess` 等额外保护。也可以只在内网访问。
- 您可以根据需要修改表格显示的字段，或者增加按测试名称、用户邮箱的筛选功能（代码中已实现）。

现在，您可以通过这个后台随时为用户手动解锁完整报告，无需用户等待支付。等正式支付上线后，再替换为自动支付。
