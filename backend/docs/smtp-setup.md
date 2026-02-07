# SMTP 邮件服务器配置指南

Smart Todo 使用 SMTP 发送验证码邮件。需要在 `.env` 文件中配置以下环境变量：

```env
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=your-email@qq.com
SMTP_PASS=your-authorization-code
```

## 变量说明

| 变量 | 说明 |
|------|------|
| `SMTP_HOST` | SMTP 服务器地址 |
| `SMTP_PORT` | SMTP 服务器端口 |
| `SMTP_USER` | 发件人邮箱地址 |
| `SMTP_PASS` | 邮箱授权码或应用专用密码（非登录密码） |

## 各邮箱服务商配置

### QQ 邮箱

```env
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=your-email@qq.com
SMTP_PASS=授权码
```

**获取授权码：** 登录 QQ 邮箱 → 设置 → 账户 → POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV 服务 → 开启 POP3/SMTP 服务 → 按提示获取授权码。

### 163 邮箱

```env
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_USER=your-email@163.com
SMTP_PASS=授权码
```

**获取授权码：** 登录 163 邮箱 → 设置 → POP3/SMTP/IMAP → 开启 SMTP 服务 → 按提示设置授权码。

### Gmail

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=应用专用密码
```

**获取应用专用密码：**
1. 前往 Google 账号设置 → 安全性
2. 开启两步验证（必须）
3. 搜索"应用专用密码" → 生成新密码
4. 将生成的 16 位密码填入 `SMTP_PASS`

> 注意：Gmail 使用 587 端口（STARTTLS），需要将 `email.service.ts` 中的 `secure` 设为 `false`（当前默认值）。

### Outlook / Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=账号密码或应用密码
```

**说明：** 使用账号密码即可。如果开启了两步验证，需要在 Microsoft 账户安全设置中生成应用密码。

> 注意：Outlook 同样使用 587 端口（STARTTLS），`secure` 保持 `false`。

## 端口与加密方式

| 端口 | 加密方式 | `secure` 值 | 适用 |
|------|----------|-------------|------|
| 465 | SSL/TLS | `true` | QQ、163 |
| 587 | STARTTLS | `false` | Gmail、Outlook |

当前代码中 `secure` 默认为 `false`。如果使用 QQ 或 163 邮箱（465 端口），需要修改 `src/modules/auth/services/email.service.ts` 中的 `secure` 为 `true`，或通过环境变量控制。
