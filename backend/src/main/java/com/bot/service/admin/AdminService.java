package com.bot.service.admin;

import com.bot.controller.admin.dto.AdminStatsResponse;
import com.bot.controller.admin.dto.AdminUserRequest;
import com.bot.entity.User;
import com.bot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service chứa business logic cho Admin Dashboard.
 * Quản lý user CRUD, thống kê hệ thống.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Lấy danh sách tất cả users (có phân trang).
     */
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    /**
     * Tìm kiếm users theo keyword (username, email, fullName).
     */
    public List<User> searchUsers(String keyword) {
        return userRepository.searchByKeyword(keyword);
    }

    /**
     * Lấy chi tiết 1 user theo ID.
     */
    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user với ID: " + id));
    }

    /**
     * Admin tạo user mới.
     */
    @Transactional
    public User createUser(AdminUserRequest request) {
        // Validate unique constraints
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username '" + request.getUsername() + "' đã tồn tại.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email '" + request.getEmail() + "' đã tồn tại.");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole() != null ? request.getRole() : "USER")
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();

        log.info("Admin tạo user mới: {}", request.getUsername());
        return userRepository.save(user);
    }

    /**
     * Admin cập nhật thông tin user.
     */
    @Transactional
    public User updateUser(UUID id, AdminUserRequest request) {
        User user = getUserById(id);

        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            // Check unique nếu đổi username
            if (!request.getUsername().equals(user.getUsername())
                    && userRepository.existsByUsername(request.getUsername())) {
                throw new IllegalArgumentException("Username '" + request.getUsername() + "' đã tồn tại.");
            }
            user.setUsername(request.getUsername());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (!request.getEmail().equals(user.getEmail())
                    && userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email '" + request.getEmail() + "' đã tồn tại.");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }
        // Update password nếu được cung cấp
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        log.info("Admin cập nhật user: {} (ID: {})", user.getUsername(), id);
        return userRepository.save(user);
    }

    /**
     * Admin xóa user.
     */
    @Transactional
    public void deleteUser(UUID id) {
        User user = getUserById(id);
        log.warn("Admin xóa user: {} (ID: {})", user.getUsername(), id);
        userRepository.delete(user);
    }

    /**
     * Toggle trạng thái user (ACTIVE ↔ INACTIVE).
     */
    @Transactional
    public User toggleUserStatus(UUID id) {
        User user = getUserById(id);
        String newStatus = "ACTIVE".equals(user.getStatus()) ? "INACTIVE" : "ACTIVE";
        user.setStatus(newStatus);
        log.info("Admin toggle status user {} → {}", user.getUsername(), newStatus);
        return userRepository.save(user);
    }

    /**
     * Lấy thống kê tổng quan hệ thống.
     */
    public AdminStatsResponse getStats() {
        List<User> allUsers = userRepository.findAll();
        long totalUsers = allUsers.size();
        long activeUsers = allUsers.stream().filter(u -> "ACTIVE".equals(u.getStatus())).count();
        long inactiveUsers = allUsers.stream().filter(u -> !"ACTIVE".equals(u.getStatus())).count();
        long adminUsers = allUsers.stream().filter(u -> "ADMIN".equals(u.getRole())).count();

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .adminUsers(adminUsers)
                .build();
    }
}
