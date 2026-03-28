package com.bot.controller.place;

import com.bot.entity.Place;
import com.bot.entity.UserFavorite;
import com.bot.service.place.PlaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller đảm nhận các giao tiếp API liên quan đến các địa điểm 
 * (Nhà hàng, Khách sạn) và danh sách yêu thích của người dùng.
 */
@RestController
@RequestMapping("/api/v1/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    /**
     * Endpoint cung cấp toàn bộ danh sách tập hợp các Địa điểm đang mở khả dụng.
     * Dùng để render Feed tổng hợp trên UI Frontend.
     *
     * @return Một tập JSON Array chứa nhiều Object Place và mã Code 200.
     */
    @GetMapping
    public ResponseEntity<List<Place>> getAllActivePlaces() {
        return ResponseEntity.ok(placeService.getAllActivePlaces());
    }

    /**
     * Nạp dữ liệu danh sách địa điểm theo tiêu chí Danh mục tĩnh.
     *
     * @param categoryId Mã ID dạng Interger (Ví dụ: ID=1 - Ẩm thực / Nhà Hàng, ID=2 - Lưu trú / Khách Sạn).
     * @return Một List Object chứa riêng rẽ loại địa điểm đã chọn theo query Parameter ID.
     */
    @GetMapping("/category/{categoryVi}")
    public ResponseEntity<List<Place>> getPlacesByCategoryId(@PathVariable String categoryVi) {
        return ResponseEntity.ok(placeService.getPlacesByCategory(categoryVi));
    }

    /**
     * API truy vấn dữ liệu từ bảng giao dịch n-n (UserFavorite).
     * Phục vụ hiển thị trang "Khu vực Yêu thích của tôi" trong bảng Profile User.
     *
     * @param userId Định danh người dùng (UUID).
     * @return Response Body đính kèm danh sách mô hình danh lam / tổ hợp giải trí / ẩm thực do User chọn.
     */
    @GetMapping("/favorites/user/{userId}")
    public ResponseEntity<List<Place>> getUserFavorites(@PathVariable UUID userId) {
        return ResponseEntity.ok(placeService.getUserFavorites(userId));
    }

    /**
     * Giao thức tích hợp nút Tương tác Action thêm địa điểm vào mục "Đã Thích".
     *
     * @param userId UUID User đang thực thi yêu cầu (từ Cookie / Token Payload).
     * @param placeId Định dạng Integer, đại diện phân biệt địa danh muốn đưa vào list Favorites.
     * @return Cấu trúc Model UserFavorite xác nhận ghi sự kiện thành công; trả HTTP 400 Bad Request nếu thao tác trùng lặp.
     */
    @PostMapping("/favorites/user/{userId}/{placeId}")
    public ResponseEntity<UserFavorite> addFavorite(@PathVariable UUID userId, @PathVariable String placeId) {
        try {
            return ResponseEntity.ok(placeService.addFavorite(userId, placeId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * API gỡ bỏ, xoá bỏ khỏi danh sách tracking lưu trữ một điểm đến.
     *
     * @param favoriteId ID đại diện cho chuỗi tham chiếu Record (bản ghi) Yêu Thích trong Database chứ không phải ID Place trỏ trực tiếp.
     * @return HTTP Code 204 No Content xác nhận việc xóa hoàn thành trơn tru không trả về thông điệp body thừa.
     */
    @DeleteMapping("/favorites/{favoriteId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable UUID favoriteId) {
        placeService.removeFavorite(favoriteId);
        return ResponseEntity.noContent().build();
    }
}
