/**
 * placeService.js — Dịch vụ API quản lý địa điểm và danh sách yêu thích.
 *
 * Module này chứa các hàm gọi API liên quan đến:
 * - Lấy danh sách tất cả địa điểm (getAllPlaces)
 * - Lọc địa điểm theo danh mục (getPlacesByCategory)
 * - Quản lý danh sách yêu thích: xem, thêm, xóa (getUserFavorites, addFavorite, removeFavorite)
 *
 * Dữ liệu địa điểm bao gồm: nhà hàng, quán ăn, khách sạn, điểm du lịch, quán cà phê...
 * Backend lấy từ bảng 'places' trong PostgreSQL.
 *
 * Sử dụng trong các trang:
 * - ExplorePage: hiển thị và lọc địa điểm
 * - PlaceDetailPage: chi tiết + nút yêu thích
 * - SavedPlacesPage: danh sách yêu thích của user
 */
import api from './api';

const placeService = {
  /**
   * Lấy danh sách tất cả địa điểm.
   *
   * Gọi: GET /api/v1/places
   *
   * Trả về toàn bộ địa điểm trong hệ thống (có phân trang nếu backend hỗ trợ).
   * Dùng cho ExplorePage khi không có bộ lọc.
   *
   * @returns {Promise<Array>} Danh sách Place { id, name, description, category, address, ... }
   */
  async getAllPlaces() {
    const response = await api.get('/v1/places');
    return response.data;
  },

  /**
   * Lấy danh sách địa điểm theo danh mục (category).
   *
   * Gọi: GET /api/v1/places/category/{categoryId}
   *
   * Ví dụ categoryId: 1 = ẩm thực, 2 = du lịch, 3 = lưu trú,...
   * Dùng khi người dùng bấm nút lọc trên ExplorePage.
   *
   * @param {number} categoryId - ID của danh mục cần lọc
   * @returns {Promise<Array>} Danh sách Place thuộc danh mục đã chọn
   */
  async getPlacesByCategory(categoryId) {
    const response = await api.get(`/v1/places/category/${categoryId}`);
    return response.data;
  },

  /**
   * Lấy danh sách địa điểm yêu thích của một người dùng.
   *
   * Gọi: GET /api/v1/places/favorites/user/{userId}
   *
   * Dùng cho SavedPlacesPage — hiển thị các địa điểm đã lưu.
   * Yêu cầu đăng nhập (cần JWT token trong header).
   *
   * @param {string} userId - UUID của người dùng (lấy từ useAuth hook)
   * @returns {Promise<Array>} Danh sách UserFavorite { id, place: Place, createdAt }
   */
  async getUserFavorites(userId) {
    const response = await api.get(`/v1/places/favorites/user/${userId}`);
    return response.data;
  },

  /**
   * Thêm một địa điểm vào danh sách yêu thích.
   *
   * Gọi: POST /api/v1/places/favorites/user/{userId}/{placeId}
   *
   * Khi người dùng bấm nút ❤️ trên PlaceDetailPage.
   * Backend tạo bản ghi UserFavorite liên kết user với place.
   *
   * @param {string} userId  - UUID của người dùng
   * @param {string} placeId - ID của địa điểm muốn yêu thích
   * @returns {Promise<Object>} UserFavorite mới tạo { id, userId, placeId, createdAt }
   */
  async addFavorite(userId, placeId) {
    const response = await api.post(`/v1/places/favorites/user/${userId}/${placeId}`);
    return response.data;
  },

  /**
   * Xóa một địa điểm khỏi danh sách yêu thích.
   *
   * Gọi: DELETE /api/v1/places/favorites/{favoriteId}
   *
   * Khi người dùng bấm nút bỏ yêu thích trên SavedPlacesPage hoặc PlaceDetailPage.
   *
   * @param {string} favoriteId - ID của bản ghi UserFavorite (KHÔNG phải placeId)
   * @returns {Promise<void>} Không trả về data, chỉ HTTP 204 No Content
   */
  async removeFavorite(favoriteId) {
    await api.delete(`/v1/places/favorites/${favoriteId}`);
  },
};

export default placeService;
