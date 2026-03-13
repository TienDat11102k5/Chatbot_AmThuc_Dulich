package com.bot.service.place;

import com.bot.entity.Place;
import com.bot.entity.User;
import com.bot.entity.UserFavorite;
import com.bot.repository.PlaceRepository;
import com.bot.repository.UserFavoriteRepository;
import com.bot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service quản lý các nghiệp vụ liên quan đến Địa điểm (Place) 
 * và danh sách Địa điểm yêu thích của người dùng (UserFavorite).
 */
@Service
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceRepository placeRepository;
    private final UserFavoriteRepository userFavoriteRepository;
    private final UserRepository userRepository;

    /**
     * Trích xuất danh sách toàn bộ các địa điểm (nhà hàng, khách sạn, v.v) đang hoạt động thực thụ trên hệ thống.
     * Phục vụ mục đích render bộ nhớ dữ liệu hoặc tính toán AI mà bỏ qua các điểm đã bị vô hiệu (is_active = false).
     * 
     * @return Danh sách mảng các đối tượng Place thỏa mãn.
     */
    public List<Place> getAllActivePlaces() {
        return placeRepository.findAllByIsActiveTrue();
    }

    /**
     * Trích xuất danh sách địa điểm lọc tĩnh theo danh mục (Category) cụ thể.
     * 
     * @param categoryId Mã ID của danh mục cần lọc (ví dụ: 1 cho Ẩm thực, 2 cho Khách sạn).
     * @return Danh sách mảng các đối tượng Place thỏa mãn đúng mã ID.
     */
    public List<Place> getPlacesByCategory(Integer categoryId) {
        return placeRepository.findByCategoryIdAndIsActiveTrue(categoryId);
    }

    /**
     * Truy xuất các địa điểm mà một User đã lưu vào mục Favorites cá nhân trước đây.
     * Dữ liệu trả về ưu tiên sắp xếp phần tử lưu trữ mới nhất hiển thị lên trước.
     * 
     * @param userId Định danh UUID của người dùng.
     * @return Danh sách đã biến đổi mảng từ UserFavorite ra đối tượng Place.
     */
    public List<Place> getUserFavorites(UUID userId) {
        List<UserFavorite> favorites = userFavoriteRepository.findAllByUserIdOrderBySavedAtDesc(userId);
        return favorites.stream().map(UserFavorite::getPlace).collect(Collectors.toList());
    }

    /**
     * Gán và thêm một địa điểm mới vào danh sách yêu thích của User thao tác.
     * Cơ chế ngăn ngừa trùng lặp dữ liệu: Nếu Place đã rớt vào danh sách yêu thích, hệ thống sẽ từ chối truy cập.
     * 
     * @param userId Mã UUID của User thao tác.
     * @param placeId ID của Địa điểm mục tiêu được yêu thích.
     * @return Đối tượng thực thể UserFavorite lưu xuống database thành công.
     * @throws IllegalArgumentException Nếu địa điểm đã lưu trước đó, hoặc bị sai định danh User/Place.
     */
    public UserFavorite addFavorite(UUID userId, Integer placeId) {
        if (userFavoriteRepository.existsByUserIdAndPlaceId(userId, placeId)) {
            throw new IllegalArgumentException("Địa điểm này đã nằm trong danh sách yêu thích");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy User"));
        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Địa điểm"));

        UserFavorite favorite = UserFavorite.builder()
                .user(user)
                .place(place)
                .build();

        return userFavoriteRepository.save(favorite);
    }
    
    /**
     * Xóa vĩnh viễn một tham chiếu địa điểm khỏi danh sách dữ kiện yêu thích của User.
     * 
     * @param favoriteId ID duy nhất của bản ghi giao dịch yêu thích (từ bảng user_favorite).
     */
    public void removeFavorite(UUID favoriteId) {
        userFavoriteRepository.deleteById(favoriteId);
    }
}
