package com.bot.service.user;

import com.bot.controller.user.dto.ChangePasswordRequest;
import com.bot.controller.user.dto.ProfileUpdateRequest;
import com.bot.entity.User;
import com.bot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

/**
 * Service xử lý các nghiệp vụ liên quan đến User (người dùng).
 * Bao gồm: xem hồ sơ, cập nhật thông tin, đổi mật khẩu, cập nhật avatar.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // NOTE: Nghiệp vụ đăng ký nằm ở AuthService.
    // Hàm createUser này chủ yếu dùng cho admin.
    public User createUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username đã được sử dụng");
        }
        return userRepository.save(user);
    }

    /**
     * Lấy thông tin user hiện tại đang đăng nhập dựa vào JWT token.
     * Sử dụng SecurityContextHolder để lấy username từ principal.
     *
     * @return Optional<User> chứa thông tin user đang đăng nhập
     */
    public Optional<User> getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails userDetails) {
            username = userDetails.getUsername();
        } else {
            username = principal.toString();
        }
        return userRepository.findByUsername(username);
    }

    /**
     * Tìm kiếm thông tin user theo username.
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Tìm kiếm thông tin user theo UUID.
     */
    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    /**
     * Cập nhật thông tin hồ sơ cá nhân (fullName, username, email).
     *
     * @param id  UUID của user cần cập nhật
     * @param req DTO chứa thông tin mới
     * @return User đã được cập nhật
     * @throws IllegalArgumentException nếu user không tồn tại hoặc username/email đã bị chiếm
     */
    public User updateProfile(UUID id, ProfileUpdateRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với ID: " + id));

        // Update fullName nếu được cung cấp
        if (req.getFullName() != null && !req.getFullName().isBlank()) {
            user.setFullName(req.getFullName());
        }

        // Update username nếu được cung cấp và không trùng
        if (req.getUsername() != null && !req.getUsername().isBlank()) {
            if (!req.getUsername().equals(user.getUsername())
                    && userRepository.existsByUsername(req.getUsername())) {
                throw new IllegalArgumentException("Tên đăng nhập '" + req.getUsername() + "' đã được sử dụng.");
            }
            user.setUsername(req.getUsername());
        }

        // Update email nếu được cung cấp và không trùng
        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            if (!req.getEmail().equals(user.getEmail())
                    && userRepository.existsByEmail(req.getEmail())) {
                throw new IllegalArgumentException("Email '" + req.getEmail() + "' đã được sử dụng.");
            }
            user.setEmail(req.getEmail());
        }

        return userRepository.save(user);
    }

    /**
     * Đổi mật khẩu người dùng.
     * Yêu cầu xác minh mật khẩu cũ và kiểm tra khớp mật khẩu mới.
     *
     * @param id  UUID của user
     * @param req DTO chứa mật khẩu hiện tại và mật khẩu mới
     * @throws IllegalArgumentException nếu mật khẩu cũ sai hoặc mật khẩu mới không khớp
     */
    public void changePassword(UUID id, ChangePasswordRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với ID: " + id));

        // Xác minh mật khẩu hiện tại
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không chính xác.");
        }

        // Kiểm tra mật khẩu mới và xác nhận phải khớp nhau
        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu mới và xác nhận mật khẩu không khớp.");
        }

        // Hash và lưu mật khẩu mới
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    /**
     * Cập nhật đường dẫn URL ảnh avatar cho người dùng.
     *
     * @param id        UUID của user
     * @param avatarUrl Đường dẫn URL tĩnh của ảnh vừa upload
     * @return User đã được cập nhật
     */
    public User updateAvatarUrl(UUID id, String avatarUrl) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với ID: " + id));
        user.setAvatarUrl(avatarUrl);
        return userRepository.save(user);
    }

    /**
     * Cập nhật sở thích (preferences) cho người dùng.
     *
     * @param id              UUID của user
     * @param preferencesJson Chuỗi JSON preferences
     * @return User đã được cập nhật
     */
    public User updatePreferences(UUID id, String preferencesJson) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));
        user.setPreferences(preferencesJson);
        return userRepository.save(user);
    }

    /**
     * Xóa ảnh avatar của người dùng.
     *
     * @param id UUID của user
     * @return User đã được cập nhật (avatarUrl = null)
     */
    public User removeAvatar(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với ID: " + id));
        user.setAvatarUrl(null);
        return userRepository.save(user);
    }
}
