package com.bot.repository;

import com.bot.entity.Place;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository xử lý truy vấn CSDL cho bảng `places`.
 */
@Repository
public interface PlaceRepository extends JpaRepository<Place, String> {
    
    // Tìm địa điểm theo tỉnh/thành phố
    List<Place> findByProvince(String province);
    
    // Tìm địa điểm theo domain (Ẩm thực, Du lịch)
    List<Place> findByDomain(String domain);
    
    // Tìm địa điểm theo category_vi
    List<Place> findByCategoryVi(String categoryVi);
}
