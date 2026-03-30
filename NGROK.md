# Chạy với ngrok (truy cập từ thiết bị khác)

## Cài đặt

```bash
npm install
```

## Chạy server + ngrok

```bash
npm run ngrok
```

Hoặc:

```bash
node server.js --ngrok
```

## Lấy Auth Token (bắt buộc)

1. Đăng ký miễn phí tại https://ngrok.com
2. Lấy auth token từ dashboard
3. Set biến môi trường:

**Windows (PowerShell):**
```powershell
$env:NGROK_AUTHTOKEN = "your-token-here"
npm run ngrok
```

**Windows (CMD):**
```cmd
set NGROK_AUTHTOKEN=your-token-here
npm run ngrok
```

**Linux/Mac:**
```bash
export NGROK_AUTHTOKEN=your-token-here
npm run ngrok
```

## Kết quả

Sau khi chạy, console sẽ hiển thị URL dạng `https://xxxx.ngrok-free.app`. Dùng URL này để truy cập từ điện thoại, tablet hoặc máy khác.
