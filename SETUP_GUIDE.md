# HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY DỰ ÁN

## Yêu cầu hệ thống

- **Docker Desktop** (Windows/Mac) hoặc **Docker Engine** (Linux)
- **Git** để clone source code
- **8GB RAM** khả dụng
- **10GB** dung lượng ổ cứng trống

## Bước 1: Cài đặt Docker

### Windows:
1. Tải Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Cài đặt và khởi động Docker Desktop
3. Kiểm tra: `docker --version`

### Mac:
```bash
# Sử dụng Homebrew
brew install --cask docker
```

### Linux (Ubuntu):
```bash
# Cài đặt Docker
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl start docker
sudo usermod -aG docker $USER
```

## Bước 2: Tải source code

```bash
# Clone repository
git clone <repository-url>
cd Chatbot_AmThuc_Dulich

# Hoặc giải nén file ZIP nếu được gửi qua email
unzip Chatbot_AmThuc_Dulich.zip
cd Chatbot_AmThuc_Dulich
```

## Bước 3: Cấu hình môi trường

### Tạo file .env cho Frontend (Tùy chọn)

```bash
cd frontend
cp .env.example .env
```

**Nội dung file frontend/.env:**
```env
# API Backend URL (mặc định đã đúng)
VITE_API_URL=http://localhost:8080/api

# Google OAuth (tùy chọn - chỉ cần khi test đăng nhập Google)
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### Tạo file .env cho Docker (Tùy chọn)

```bash
cd docker
cp .env.example .env
```

**Nội dung file docker/.env:**
```env
# Database (Có thể để mặc định)
DB_USERNAME=admin
DB_PASSWORD=password

# JWT Secret (Có thể để mặc định cho demo)
JWT_SECRET=demo_jwt_secret_key_for_testing

# Email (Tùy chọn - chỉ cần khi test gửi email)
MAIL_USERNAME=your_gmail@gmail.com
MAIL_PASSWORD=your_gmail_app_password

# Google OAuth (Tùy chọn - chỉ cần khi test đăng nhập Google)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

**LƯU Ý:** Nếu không tạo file .env, hệ thống sẽ dùng giá trị mặc định và vẫn chạy được!

## Bước 4: Khởi chạy hệ thống

```bash
# Di chuyển vào thư mục docker
cd docker

# Khởi chạy tất cả services
docker compose up -d

# Xem logs để kiểm tra
docker compose logs -f
```

## Bước 5: Chờ hệ thống khởi động

**Thời gian khởi động:** 2-3 phút lần đầu (tải images + build)

**Kiểm tra trạng thái:**
```bash
docker compose ps
```

**Tất cả container phải có status "healthy" hoặc "running"**

## Bước 6: Truy cập ứng dụng

Sau khi tất cả container chạy thành công:

- **Frontend (Giao diện chính):** http://localhost:3000
- **Backend API:** http://localhost:8080
- **AI Service API Docs:** http://localhost:8000/docs
- **RabbitMQ Management:** http://localhost:15672 (admin/password)

## Bước 7: Test chức năng

1. Truy cập http://localhost:3000
2. Đăng ký tài khoản mới hoặc đăng nhập
3. Thử chat với bot: "Tìm quán phở ở Hà Nội"
4. Kiểm tra kết quả gợi ý

## Dừng hệ thống

```bash
# Dừng tất cả services
docker compose down

# Dừng và xóa dữ liệu (reset hoàn toàn)
docker compose down -v
```

## Xử lý lỗi thường gặp

### Lỗi: Port đã được sử dụng
```bash
# Kiểm tra port đang dùng
netstat -ano | findstr :3000
netstat -ano | findstr :8080

# Thay đổi port trong docker-compose.yml nếu cần
```

### Lỗi: Docker không đủ RAM
```bash
# Tăng RAM cho Docker Desktop: Settings > Resources > Memory > 6GB
```

### Lỗi: Container không start
```bash
# Xem logs chi tiết
docker compose logs backend
docker compose logs ai_service

# Rebuild nếu cần
docker compose build --no-cache
docker compose up -d
```

## Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs: `docker compose logs -f`
2. Kiểm tra Docker Desktop đang chạy
3. Đảm bảo port 3000, 8080, 8000 không bị chiếm
4. Liên hệ nhóm phát triển

---

**Mục tiêu:** Giáo viên chỉ cần chạy 2 lệnh để có hệ thống hoạt động:
```bash
cd docker
docker compose up -d
```