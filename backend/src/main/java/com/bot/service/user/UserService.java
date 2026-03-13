package com.bot.service.user;

import com.bot.entity.User;
import com.bot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

/**
 * Service xử lý các nghiệp vụ liên quan đến User (người dùng).
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // Chú ý: Nghiệp vụ đăng ký thường nằm bên AuthService.
    // Hàm này chủ yếu dùng cho mục đích admin hoặc test.
    public User createUser(User user) {
        // Kiểm tra xem username đã có người dùng chưa
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username đã được sử dụng");
        }
        return userRepository.save(user);
    }

    /**
     * Tìm kiếm thông tin chi tiết người dùng dựa trên tên đăng nhập.
     * 
     * @param username Tên đăng nhập của người dùng.
     * @return Optional<User> chứa đối tượng User nếu tìm thấy, ngược lại trả về rỗng (empty).
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Tìm kiếm thông tin người dùng theo định danh gốc duy nhất (UUID).
     * 
     * @param id Chuỗi ID (UUID) của người dùng.
     * @return Optional<User> chứa đối tượng User nếu tìm kiếm được trong cơ sở dữ liệu.
     */
    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    /**
     * Cập nhật sở thích (preferences) cá nhân hóa cho người dùng vào hồ sơ.
     * Dữ liệu JSON linh hoạt giúp lưu giữ các tuỳ chỉnh đặc thù từ UI (ví dụ: món yêu thích, ngôn ngữ).
     * 
     * @param id Mã định danh UUID của người dùng cần cập nhật.
     * @param preferencesJson Chuỗi định dạng JSON đại diện cho cấu trúc sở thích.
     * @return Đối tượng User đã được cập nhật thành công xuống cơ sở dữ liệu.
     * @throws IllegalArgumentException Nếu Id người dùng không hợp lệ.
     */
    public User updatePreferences(UUID id, String preferencesJson) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));
                
        user.setPreferences(preferencesJson);
        return userRepository.save(user);
    }
}

