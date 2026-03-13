package com.bot.repository;

import com.bot.entity.UserFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository thao tác với bảng `user_favorites` (Địa điểm yêu thích của người dùng).
 */
@Repository
public interface UserFavoriteRepository extends JpaRepository<UserFavorite, UUID> {
    
    // Lấy danh sách địa điểm yêu thích của một user cụ thể, xếp theo thời gian lưu mới nhất
    List<UserFavorite> findAllByUserIdOrderBySavedAtDesc(UUID userId);
    
    // Kiểm tra xem user này đã lưu địa điểm này chưa (tránh lưu trùng)
    boolean existsByUserIdAndPlaceId(UUID userId, Integer placeId);
}

