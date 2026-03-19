package com.bot.repository;

import com.bot.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository xử lý các thao tác CSDL cho bảng `users`.
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    // Tìm người dùng theo tên đăng nhập (dùng cho Login)
    Optional<User> findByUsername(String username);
    
    // Tìm người dùng theo email (dùng cho Forgot Password / Login bằng Email)
    Optional<User> findByEmail(String email);
    
    // Kiểm tra xem username đã tồn tại chưa (dùng cho Register)
    boolean existsByUsername(String username);

    // Kiểm tra xem email đã tồn tại chưa (dùng cho updateProfile)
    boolean existsByEmail(String email);

    // Tìm kiếm user theo keyword (username, email, fullName) — dùng cho Admin search
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<User> searchByKeyword(@Param("keyword") String keyword);
}

