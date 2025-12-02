# Hướng Dẫn Cài Đặt Hệ Thống Admin

## 1. Cài Đặt Database

### Bước 1: Tạo bảng admins

Chạy file SQL `database_admin.sql` trong MySQL:

```bash
mysql -u root -p mini_soccer_db < database_admin.sql
```

Hoặc import trực tiếp qua phpMyAdmin/MySQL Workbench.

### Bước 2: Kiểm tra bảng admins

```sql
SELECT * FROM admins;
```

Bạn sẽ thấy 2 tài khoản admin mặc định:
- **Super Admin**: username: `admin` / password: `admin123`
- **Manager**: username: `manager` / password: `admin123`

## 2. Cấu Hình Backend

### Bước 1: Kiểm tra file .env

Đảm bảo file `backend/.env` có các biến sau:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mini_soccer_db
JWT_SECRET=your_super_secret_key_here_change_in_production
```

### Bước 2: Cài đặt dependencies (nếu chưa cài)

```bash
cd backend
npm install
```

### Bước 3: Khởi động server

```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

## 3. Cấu Hình Frontend

### Bước 1: Cài đặt dependencies (nếu chưa cài)

```bash
cd frontend
npm install
```

### Bước 2: Khởi động React app

```bash
npm start
```

App sẽ chạy tại: `http://localhost:3000`

## 4. Truy Cập Hệ Thống Admin

### Bước 1: Mở trang đăng nhập admin

```
http://localhost:3000/admin/login
```

### Bước 2: Đăng nhập với tài khoản mặc định

- **Username**: `admin`
- **Password**: `admin123`

### Bước 3: Khám phá các tính năng

Sau khi đăng nhập, bạn có thể truy cập:

- **Dashboard**: `/admin/dashboard` - Thống kê tổng quan
- **Quản lý sân**: `/admin/fields` - Thêm, sửa, xóa sân bóng
- **Đơn đặt sân**: `/admin/bookings` - Quản lý và xác nhận đơn
- **Khách hàng**: `/admin/customers` - Xem thông tin khách hàng
- **Dịch vụ**: `/admin/services` - Quản lý dịch vụ đó sung
- **Báo cáo**: `/admin/reports` - Xem báo cáo doanh thu

## 5. API Endpoints

### Authentication

```
POST   /api/admin/auth/login              - Đăng nhập admin
GET    /api/admin/auth/profile            - Lấy thông tin admin
PUT    /api/admin/auth/change-password    - Đổi mật khẩu
```

### Dashboard

```
GET    /api/admin/dashboard/stats         - Thống kê dashboard
GET    /api/admin/dashboard/revenue-chart - Dữ liệu biểu đồ doanh thu
```

### Quản lý sân

```
GET    /api/admin/fields                  - Danh sách sân
POST   /api/admin/fields                  - Tạo sân mới
PUT    /api/admin/fields/:id              - Cập nhật sân
DELETE /api/admin/fields/:id              - Xóa sân
```

### Quản lý đơn đặt

```
GET    /api/admin/bookings                - Danh sách đơn đặt
GET    /api/admin/bookings/stats          - Thống kê đơn đặt
PUT    /api/admin/bookings/:id/status     - Cập nhật trảng thái
DELETE /api/admin/bookings/:id            - Xóa đơn
```

### Quản lý khách hàng

```
GET    /api/admin/customers               - Danh sách khách hàng
GET    /api/admin/customers/stats         - Thống kê khách hàng
GET    /api/admin/customers/:id           - Chi tiết khách hàng
```

### Quản lý dịch vụ

```
GET    /api/admin/services                - Danh sách dịch vụ
POST   /api/admin/services                - Tạo dịch vụ
PUT    /api/admin/services/:id            - Cập nhật dịch vụ
DELETE /api/admin/services/:id            - Xóa dịch vụ
```

### Báo cáo

```
GET    /api/admin/reports/revenue-by-field    - Doanh thu theo sân
GET    /api/admin/reports/monthly-stats       - Thống kê theo tháng
GET    /api/admin/reports/top-customers       - Top khách hàng
```

## 6. Bảo Mật

### Đổi mật khẩu mặc định

**QUAN TRỌNG**: Ngay sau khi cài đặt, hãy đổi mật khẩu mặc định!

1. Đăng nhập với tài khoản admin
2. Vào trang profile (sắp tới)
3. Chọn "Đổi mật khẩu"

Hoặc sử dụng API:

```bash
curl -X PUT http://localhost:5000/api/admin/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "admin123",
    "newPassword": "your_new_secure_password"
  }'
```

### Tạo admin mới

Chạy lệnh SQL:

```sql
-- Mã hóa mật khẩu trước bằng bcrypt online hoặc code
INSERT INTO admins (username, password, email, full_name, phone, role, status)
VALUES ('newadmin', 'HASHED_PASSWORD_HERE', 'newadmin@example.com', 'Tên Admin Mới', '0909123456', 'admin', 'active');
```

## 7. Troubleshooting

### Lỗi: "Token không hợp lệ"

- Kiểm tra `JWT_SECRET` trong file `.env`
- Xóa localStorage và đăng nhập lại

### Lỗi: "Không kết nối được database"

- Kiểm tra MySQL đang chạy
- Xác nhận thông tin database trong `.env`
- Chạy lại script SQL

### Lỗi: "CORS"

- Đảm bảo backend chạy ở port 5000
- Kiểm tra cấu hình CORS trong `server.js`

### Không thấy dữ liệu

- Kiểm tra database có dữ liệu mẫu
- Xem console log trong browser (F12)
- Kiểm tra Network tab để xem API responses

## 8. Tính Năng Tiếp Theo

- [ ] Upload ảnh cho sân bóng
- [ ] Xuất báo cáo PDF/Excel
- [ ] Thông báo real-time
- [ ] Quản lý quyền admin (roles & permissions)
- [ ] Lịch sử thay đổi (audit logs)
- [ ] Dashboard analytics nâng cao

## 9. Liên Hệ

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub.

---

**Phát triển bởi**: Võ Tấn Thịnh - MSSV: 2251120252  
**Trường**: Đại Học Giao Thông Vận Tải TP.HCM