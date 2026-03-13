package com.bot.repository;

import com.bot.entity.Place;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository xử lý truy vấn CSDL cho bảng `places`.
 */
@Repository
public interface PlaceRepository extends JpaRepository<Place, Integer> {
    
    // Lấy tất cả các địa điểm đang hoạt động
    List<Place> findAllByIsActiveTrue();
    
    // Lấy tất cả địa điểm thuộc một danh mục cụ thể và đang hoạt động
    List<Place> findByCategoryIdAndIsActiveTrue(Integer categoryId);
}

