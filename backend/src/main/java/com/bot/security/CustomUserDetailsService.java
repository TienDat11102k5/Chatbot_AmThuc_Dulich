package com.bot.security;

import com.bot.entity.User;
import com.bot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Service tích hợp với Spring Security để tải thông tin người dùng từ Database 
 * trong quá trình xác thực (Authentication).
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Ghi đè phương thức chuẩn của Spring Security để tìm kiếm User bằng Tên đăng nhập (username).
     *
     * @param username Tên truy cập mà client truyền lên khi cố gắng xác thực.
     * @return Đối tượng đóng gói UserDetails tương thích với Cơ chế Security.
     * @throws UsernameNotFoundException Nếu không rà soát thấy record bản ghi nào khớp với tham số này.
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng có Tên đăng nhập: " + username));

        return new CustomUserDetails(user);
    }
}
