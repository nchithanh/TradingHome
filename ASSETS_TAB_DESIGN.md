# Thiết kế tab Tài sản (Asset Management)

## 1. Nhu cầu
- Quản lý tài khoản chứng khoán tại **2 công ty** (SSI, VPS, FPT, Vietcap, ...)
- Theo dõi: **Tiền mặt (Cash)**, **Danh mục (Portfolio)**, **Ký quỹ (Margin)**

---

## 2. Cấu trúc dữ liệu đề xuất

Mỗi công ty/broker:

| Trường | Mô tả |
|--------|-------|
| `id` | Mã định danh (SSI, VPS, ...) |
| `name` | Tên hiển thị |
| `cash` | Tiền mặt khả dụng (VNĐ) |
| `portfolioValue` | Giá trị danh mục (thị trường) |
| `marginUsed` | Ký quỹ đã dùng |
| `marginAvailable` | Ký quỹ còn khả dụng |
| `marginTotal` | Tổng hạn mức margin (nếu có) |

---

## 3. Các phương án giao diện

### Phương án A: Tab chính + Tab Tài sản
- Thanh tab phía trên: **[Chính]** | **[Tài sản]**
- Tab Chính: nội dung hiện tại (mapping, PiP, suggest...)
- Tab Tài sản: giao diện quản lý tài sản

### Phương án B: Section mở rộng (Accordion)
- Thêm section "Tài sản" có thể thu gọn/mở rộng
- Nằm dưới overview-grid, trên phần settings
- Không tách trang, dễ xem cùng lúc

### Phương án C: Sidebar + Panel
- Sidebar bên trái: Chính | Tài sản
- Panel chính thay đổi theo tab
- Phù hợp khi có nhiều tab sau này

---

## 4. Giao diện chi tiết Tab Tài sản (đề xuất)

### 4.1 Layout tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│  TỔNG TÀI SẢN                                                    │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│ Tiền mặt     │ Danh mục     │ Ký quỹ       │ Tổng               │
│ 150.000.000  │ 320.000.000  │ -50.000.000  │ 420.000.000        │
└──────────────┴──────────────┴──────────────┴────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  CÔNG TY 1: SSI                                    [Sửa] [Xóa]   │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│ Tiền mặt     │ Danh mục     │ Ký quỹ dùng  │ Ký quỹ còn         │
│ 80.000.000   │ 180.000.000  │ 30.000.000   │ 70.000.000        │
└──────────────┴──────────────┴──────────────┴────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  CÔNG TY 2: VPS                                    [Sửa] [Xóa]   │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│ Tiền mặt     │ Danh mục     │ Ký quỹ dùng  │ Ký quỹ còn         │
│ 70.000.000   │ 140.000.000  │ 20.000.000   │ 80.000.000        │
└──────────────┴──────────────┴──────────────┴────────────────────┘

                                    [+ Thêm công ty]
```

### 4.2 Thẻ tổng (Summary cards)
- **Tổng tiền mặt** = tổng cash tất cả công ty
- **Tổng danh mục** = tổng portfolio tất cả công ty
- **Ký quỹ** = có thể hiển thị: (đã dùng / còn lại) hoặc tổng margin ròng
- **Tổng tài sản** = Cash + Portfolio (hoặc trừ margin nếu âm)

### 4.3 Thẻ từng công ty
- Mỗi công ty 1 card riêng
- Input số: tiền mặt, danh mục, margin đã dùng, margin còn
- Nút Sửa (mở form sửa), Xóa (xác nhận rồi xóa)

### 4.4 Form thêm/sửa công ty
- Tên công ty (hoặc chọn từ danh sách SSI, VPS, FPS, MBS, Vietcap...)
- Tiền mặt
- Giá trị danh mục
- Ký quỹ đã dùng
- Ký quỹ còn (hoặc hạn mức tổng)

---

## 5. Luồng dữ liệu

1. **Nhập thủ công** (bước 1): User nhập số từ app/s brokerage
2. **Lưu local**: JSON hoặc app-settings, tương tự cài đặt hiện tại
3. **Sau này** (nếu mở rộng): Import CSV, API FireAnt (nếu có)

---

## 6. Đề xuất triển khai

| Bước | Nội dung |
|------|----------|
| **Bước 1** | Thêm tab "Tài sản" (Phương án A) |
| | Tạo layout: tổng + card per broker |
| | Nhập thủ công, lưu vào settings |
| **Bước 2** | Form thêm/sửa công ty |
| **Bước 3** | Tính toán tổng, format VNĐ |

---

## 7. Thiết kế responsive

- Desktop: 4 cột (Cash | Portfolio | Margin used | Margin avail)
- Mobile: xếp dọc, mỗi card 1 hàng

---

## 8. Thuật ngữ tiếng Việt

| EN | VI |
|----|-----|
| Cash | Tiền mặt |
| Portfolio | Danh mục |
| Margin (used) | Ký quỹ đã dùng |
| Margin (available) | Ký quỹ còn |
| Total assets | Tổng tài sản |
| Broker / Company | Công ty CK |
