package com.bot.controller.user;

import com.bot.entity.User;
import com.bot.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST Controller cung cấp các endpoint API liên quan đến thao tác dữ liệu Người dùng (User).
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Endpoint cung cấp giao tiếp tạo và rẽ nhánh quản lý User mới độc lập với hệ thống JWT ban đầu.
     * Dùng chủ yếu cho nghiệp vụ backend Admin Dashboard xử lý luồng tạo tài nguyên.
     *
     * @param user Thông tin Payload Body Model User muốn tạo.
     * @return User Object vừa được khởi sinh kèm UUID.
     */
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.createUser(user));
    }

    /**
     * Truy xuất các thuộc tính chi tiết về một người dùng duy nhất thông qua chuỗi UUID.
     *
     * @param id Mã định danh duy nhất trong CSDL (UUID format).
     * @return HTTP Entity đính kèm Payload Model User đầy đủ (bỏ password), trả 404 (Not Found) nếu ID bị trượt.
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable UUID id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Thao tác gửi dữ liệu tuỳ chỉnh, thói quen và xu hướng tương tác ứng dụng (preferences) của người dùng.
     *
     * @param id Định danh UUID duy nhất thuộc User cần update.
     * @param preferencesJson Một đoạn text dạng chuẩn JSON (ví dụ cấu hình lưu settings theme mode, layout hoặc thông tin lưu đồ món ăn UI).
     * @return Mô hình đối tượng User sau cập nhật thành công (Status 200) hoặc thất bại (Status 404).
     */
    @PutMapping("/{id}/preferences")
    public ResponseEntity<User> updatePreferences(@PathVariable UUID id, @RequestBody String preferencesJson) {
        try {
            return ResponseEntity.ok(userService.updatePreferences(id, preferencesJson));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

