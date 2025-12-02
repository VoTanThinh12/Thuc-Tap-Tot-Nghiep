# Website Quản Lý Sân Bóng Mini

## Mô tả dự án

Hệ thống quản lý và đặt sân bóng mini sử dụng React.js (Frontend) và Node.js + Express (Backend) với MySQL database.

## Công nghệ sử dụng

- **Frontend**: React.js, Bootstrap 5, Axios, React Router
- **Backend**: Node.js, Express.js, MySQL2, JWT, Bcrypt
- **Database**: MySQL

## Cấu trúc dự án

```
mini-football-booking/
├── backend/          # Node.js Backend
├── frontend/         # React Frontend
└── database.sql      # MySQL Schema
```

## Hướng dẫn cài đặt

### 1. Clone repository

```bash
git clone https://github.com/VoTanThinh12/Thuc-Tap-Tot-Nghiep.git
cd Thuc-Tap-Tot-Nghiep
```

### 2. Cài đặt Backend

```bash
cd backend
npm install
```

### 3. Cấu hình Database

- Tạo database MySQL:

```sql
CREATE DATABASE mini_soccer_db;
```

- Import file `database.sql`
- Cập nhật file `.env` trong thư mục backend:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mini_football_db
JWT_SECRET=your_secret_key_here
```

### 4. Cài đặt Frontend

```bash
cd frontend
npm install
```

### 5. Chạy ứng dụng

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm start
```

## Truy cập ứng dụng

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Tính năng

### Khách hàng:

- ✅ Xem danh sách sân bóng
- ✅ Tìm kiếm sân theo loại, địa điểm
- ✅ Xem chi tiết sân
- ✅ Đặt sân trực tuyến
- ✅ Quản lý đơn đặt sân
- ✅ Đăng ký / Đăng nhập

### Quản trị viên:

- ✅ Quản lý sân bóng (CRUD)
- ✅ Quản lý đơn đặt sân
- ✅ Duyệt / Hủy đơn đặt
- ✅ Xem thống kê

## Tác giả

**Võ Tấn Thịnh** - MSSV: 2251120252

Trường Đại Học Giao Thông Vận Tải TP.HCM

## License

MIT License
