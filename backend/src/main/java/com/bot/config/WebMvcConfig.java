package com.bot.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Cấu hình Spring WebMVC để phân phối (serve) file ảnh tĩnh từ thư mục uploads.
 *
 * Khi user upload avatar, file lưu vào `<user.dir>/uploads/` và truy cập qua:
 * http://localhost:8080/uploads/{filename}
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    // Thư mục vật lý lưu ảnh (đọc từ application.properties)
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    /**
     * Map thư mục tĩnh uploads ra URL /uploads/**
     *
     * Ví dụ: file <user.dir>/uploads/avatar_abc123.jpg
     * → truy cập qua: http://localhost:8080/uploads/avatar_abc123.jpg
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Tính đường dẫn tuyệt đối
        String uploadAbsolutePath;
        if (Paths.get(uploadDir).isAbsolute()) {
            // Docker / production: dùng trực tiếp
            uploadAbsolutePath = Paths.get(uploadDir).toUri().toString();
        } else {
            // Local dev: tính từ user.dir (nơi JVM được khởi chạy)
            uploadAbsolutePath = Paths.get(System.getProperty("user.dir"), uploadDir)
                    .toAbsolutePath().toUri().toString();
        }

        // Đảm bảo path kết thúc bằng dấu /
        if (!uploadAbsolutePath.endsWith("/")) {
            uploadAbsolutePath += "/";
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadAbsolutePath);
    }
}
