package com.bot.service.place;

import com.bot.entity.Place;
import com.bot.entity.User;
import com.bot.entity.UserFavorite;
import com.bot.repository.PlaceRepository;
import com.bot.repository.UserFavoriteRepository;
import com.bot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service quản lý toàn bộ nghiệp vụ liên quan đến Địa điểm (Place)
 * và danh sách Yêu thích (Favorites) của người dùng.
 *
 * <p><b>Chức năng chính:</b></p>
 * <ol>
 *   <li><b>Truy vấn địa điểm:</b> Lấy toàn bộ địa điểm đang hoạt động hoặc lọc theo danh mục.
 *       Dữ liệu được cache trong Redis để giảm tải PostgreSQL.</li>
 *   <li><b>Quản lý yêu thích:</b> Thêm/xóa địa điểm vào danh sách yêu thích cá nhân.
 *       Khi thay đổi, cache Redis sẽ tự động được xóa (evict) để đảm bảo tính nhất quán.</li>
 * </ol>
 *
 * <p><b>Chiến lược Caching:</b></p>
 * <ul>
 *   <li>Cache name: "places" — TTL 10 phút (cấu hình tại {@link com.bot.config.RedisConfig}).</li>
 *   <li>Cache key pattern: "all_active" (toàn bộ) hoặc "category_{id}" (theo danh mục).</li>
 *   <li>Cache invalidation: Tự động xóa cache khi có thay đổi dữ liệu (thêm/xóa yêu thích).</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class PlaceService {

    /** Repository tương tác với bảng places trong PostgreSQL. */
    private final PlaceRepository placeRepository;

    /** Repository tương tác với bảng user_favorites trong PostgreSQL. */
    private final UserFavoriteRepository userFavoriteRepository;

    /** Repository tương tác với bảng users trong PostgreSQL. */
    private final UserRepository userRepository;

    // =========================================================================
    // 1. TRUY VẤN ĐỊA ĐIỂM (PLACE QUERY — CÓ CACHE)
    // =========================================================================

    /**
     * Lấy danh sách toàn bộ các địa điểm đang hoạt động trong hệ thống.
     *
     * <p><b>Phạm vi:</b> Chỉ trả về các địa điểm có trạng thái is_active = true,
     * loại bỏ các địa điểm đã bị vô hiệu hóa hoặc tạm ẩn.</p>
     *
     * <p><b>Cache Redis:</b> Kết quả được lưu trong cache "places" với key "all_active".
     * Lần gọi đầu tiên sẽ truy vấn PostgreSQL (~50ms), các lần sau đọc từ Redis (~2ms).
     * Cache tự động hết hạn sau 10 phút.</p>
     *
     * @return Danh sách tất cả Place đang hoạt động. Trả về danh sách rỗng nếu không có.
     */
    @Cacheable(value = "places", key = "'all_active'")
    public List<Place> getAllActivePlaces() {
        return placeRepository.findAllByIsActiveTrue();
    }

    /**
     * Lấy danh sách địa điểm được lọc theo danh mục (Category) cụ thể.
     *
     * <p><b>Ví dụ danh mục:</b>
     * categoryId=1 → Ẩm thực, categoryId=2 → Du lịch, categoryId=3 → Lưu trú.</p>
     *
     * <p><b>Cache Redis:</b> Mỗi danh mục có cache riêng với key "category_{id}".
     * VD: cache key "category_1" chứa danh sách quán ăn, "category_2" chứa danh sách điểm du lịch.</p>
     *
     * @param categoryId Mã ID của danh mục cần lọc (khớp với bảng categories).
     * @return Danh sách Place thuộc danh mục đang hoạt động. Rỗng nếu không tìm thấy.
     */
    @Cacheable(value = "places", key = "'category_' + #categoryId")
    public List<Place> getPlacesByCategory(Integer categoryId) {
        return placeRepository.findByCategoryIdAndIsActiveTrue(categoryId);
    }

    // =========================================================================
    // 2. QUẢN LÝ YÊU THÍCH (FAVORITES MANAGEMENT)
    // =========================================================================

    /**
     * Lấy danh sách các địa điểm mà người dùng đã lưu vào mục Yêu thích.
     *
     * <p>Kết quả sắp xếp từ mới nhất đến cũ nhất theo thời điểm lưu (saved_at DESC),
     * giúp Frontend hiển thị những địa điểm mới lưu ở vị trí nổi bật nhất.</p>
     *
     * <p><b>Logic biến đổi:</b> Truy vấn bảng user_favorites → nối với bảng places
     * → trích xuất và trả về danh sách đối tượng Place (bỏ qua metadata UserFavorite).</p>
     *
     * @param userId Định danh UUID của người dùng cần truy vấn.
     * @return Danh sách Place đã yêu thích, sắp xếp mới nhất trước. Rỗng nếu chưa lưu gì.
     */
    public List<Place> getUserFavorites(UUID userId) {
        List<UserFavorite> favorites = userFavoriteRepository.findAllByUserIdOrderBySavedAtDesc(userId);
        return favorites.stream()
                .map(UserFavorite::getPlace)
                .collect(Collectors.toList());
    }

    /**
     * Thêm một địa điểm vào danh sách yêu thích của người dùng.
     *
     * <p><b>Cơ chế chống trùng lặp:</b> Kiểm tra xem cặp (userId, placeId) đã tồn tại
     * trong bảng user_favorites chưa. Nếu đã có, từ chối thao tác và ném ngoại lệ.</p>
     *
     * <p><b>Quy trình xử lý:</b></p>
     * <ol>
     *   <li>Kiểm tra trùng lặp — nếu đã yêu thích thì ném lỗi.</li>
     *   <li>Xác minh User tồn tại trong database.</li>
     *   <li>Xác minh Place tồn tại trong database.</li>
     *   <li>Tạo bản ghi UserFavorite mới và lưu vào PostgreSQL.</li>
     * </ol>
     *
     * @param userId  Mã UUID của người dùng thực hiện thao tác.
     * @param placeId ID (Integer) của địa điểm mục tiêu.
     * @return Đối tượng UserFavorite đã lưu thành công, kèm ID và timestamp tự sinh.
     * @throws IllegalArgumentException Nếu: (a) đã yêu thích trước đó, (b) User/Place không tồn tại.
     */
    @CacheEvict(value = "places", allEntries = true)
    public UserFavorite addFavorite(UUID userId, Integer placeId) {
        // Bước 1: Kiểm tra trùng lặp
        if (userFavoriteRepository.existsByUserIdAndPlaceId(userId, placeId)) {
            throw new IllegalArgumentException("Địa điểm này đã nằm trong danh sách yêu thích");
        }

        // Bước 2: Xác minh User tồn tại
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy User với ID: " + userId));

        // Bước 3: Xác minh Place tồn tại
        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Địa điểm với ID: " + placeId));

        // Bước 4: Tạo và lưu bản ghi yêu thích
        UserFavorite favorite = UserFavorite.builder()
                .user(user)
                .place(place)
                .build();

        return userFavoriteRepository.save(favorite);
    }

    /**
     * Xóa một địa điểm khỏi danh sách yêu thích của người dùng.
     *
     * <p>Thao tác xóa vĩnh viễn bản ghi trong bảng user_favorites.
     * Đồng thời tự động xóa cache "places" để đảm bảo tính nhất quán dữ liệu.</p>
     *
     * @param favoriteId ID (UUID) duy nhất của bản ghi UserFavorite cần xóa.
     */
    @CacheEvict(value = "places", allEntries = true)
    public void removeFavorite(UUID favoriteId) {
        userFavoriteRepository.deleteById(favoriteId);
    }
}
