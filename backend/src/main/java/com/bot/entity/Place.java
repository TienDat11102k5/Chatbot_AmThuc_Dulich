package com.bot.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Thực thể đại diện cho một Địa điểm (Quán ăn, Khu du lịch, vv...).
 * Lưu trữ thông tin chi tiết dùng cho gợi ý (recommendation) và tìm kiếm.
 */
@Entity
@Table(name = "places")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Place {

    @Id
    private String id;

    // Tên địa điểm
    @Column(nullable = false)
    private String name;
    
    // Domain/Tags (Ẩm thực, Du lịch)
    private String domain;

    // Phân loại danh mục của địa điểm này (category_vi từ CSV)
    @Column(name = "category_vi")
    private String categoryVi;

    // Vĩ độ
    @Column(precision = 10, scale = 7)
    private java.math.BigDecimal latitude;
    
    // Kinh độ
    @Column(precision = 10, scale = 7)
    private java.math.BigDecimal longitude;

    // Địa chỉ cụ thể
    private String address;
    
    // Quận/Huyện
    private String district;
    
    // Tỉnh/Thành phố
    private String province;

    // Thông tin mô tả chi tiết
    @Column(columnDefinition = "TEXT")
    private String description;
    
    // Search text (for full-text search)
    @Column(name = "search_text", columnDefinition = "TEXT")
    private String searchText;
    
    // Data source
    @Column(name = "data_source")
    private String dataSource;
}
