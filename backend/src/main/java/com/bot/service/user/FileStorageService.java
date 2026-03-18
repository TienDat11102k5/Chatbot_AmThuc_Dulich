package com.bot.service.user;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Service xử lý lưu trữ file ảnh Avatar của người dùng.
 *
 * Chiến lược lưu trữ:
 * - Khi chạy LOCAL: lưu vào thư mục 'uploads/avatars/' tính từ working directory (thư mục backend/)
 * - Khi chạy Docker: lưu vào '/app/uploads/avatars/' (cấu hình qua app.upload.dir)
 * - URL truy cập: http://localhost:8080/uploads/avatar_xxx.jpg
 */
@Service
public class FileStorageService {

    // Base upload path (configured in application.properties)
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    // Base URL path to serve static files
    @Value("${app.upload.url:/uploads}")
    private String uploadUrl;

    /**
     * Lưu file ảnh avatar vào thư mục uploads, trả về URL tĩnh.
     *
     * @param file MultipartFile nhận từ client
     * @return Đường dẫn URL tĩnh để truy cập ảnh (vd: /uploads/avatar_abc123.jpg)
     * @throws IOException Nếu ghi file thất bại
     */
    public String saveAvatar(MultipartFile file) throws IOException {
        // Validate: file không rỗng
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File ảnh không được để trống.");
        }

        // Validate: chỉ chấp nhận file ảnh
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Chỉ chấp nhận file ảnh (jpg, png, webp...).");
        }

        // Lấy extension gốc (.jpg, .png, ...)
        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "avatar"
        );
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex).toLowerCase();
        }

        // Tạo filename unique bằng UUID
        String uniqueFilename = "avatar_" + UUID.randomUUID() + extension;

        // Tính toán đường dẫn tuyệt đối — tránh lỗi relative path khi chạy từ thư mục khác
        Path uploadPath;
        if (Paths.get(uploadDir).isAbsolute()) {
            // Docker / production: dùng đường dẫn tuyệt đối từ config
            uploadPath = Paths.get(uploadDir);
        } else {
            // Local dev: tính từ thư mục user.dir (nơi JVM được khởi chạy)
            uploadPath = Paths.get(System.getProperty("user.dir"), uploadDir);
        }

        // Tạo thư mục nếu chưa tồn tại
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Ghi file vào thư mục upload
        try (InputStream inputStream = file.getInputStream()) {
            Path targetPath = uploadPath.resolve(uniqueFilename);
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
        }

        // Trả về URL tĩnh để FE hiển thị ảnh
        return uploadUrl + "/" + uniqueFilename;
    }

    /**
     * Xóa file avatar cũ khỏi server.
     *
     * @param avatarUrl URL cũ của avatar (vd: /uploads/avatar_xxx.jpg)
     */
    public void deleteAvatar(String avatarUrl) {
        if (avatarUrl == null || avatarUrl.isBlank()) return;

        // Extract filename từ URL
        String filename = avatarUrl.replace(uploadUrl + "/", "");

        // Tính đường dẫn tuyệt đối giống trong saveAvatar
        Path uploadPath;
        if (Paths.get(uploadDir).isAbsolute()) {
            uploadPath = Paths.get(uploadDir);
        } else {
            uploadPath = Paths.get(System.getProperty("user.dir"), uploadDir);
        }

        Path filePath = uploadPath.resolve(filename);

        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Không thể xóa file avatar cũ: " + filePath + " — " + e.getMessage());
        }
    }
}
