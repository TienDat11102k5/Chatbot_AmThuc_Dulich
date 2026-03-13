package com.bot.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Thực thể đại diện cho một Địa điểm (Quán ăn, Khu du lịch, vv...).
 * Lưu trữ thông tin chi tiết dùng cho gợi ý (recommendation) và tìm kiếm (vector search).
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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Phân loại danh mục của địa điểm này (Liên kết ManyToOne)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    // Tên địa điểm
    @Column(nullable = false)
    private String name;

    // Thông tin mô tả chi tiết
    @Column(columnDefinition = "TEXT")
    private String description;

    // Địa chỉ cụ thể hoặc tọa độ
    private String location;

    // Điểm đánh giá trung bình
    private Float rating;

    // Phân khúc giá (VD: "Bình dân", "Sang trọng", "$$", "$$$")
    @Column(name = "price_range")
    private String priceRange;

    // ID reference tới Vector Database (VD: Qdrant/Milvus) dùng để truy vấn AI
    @Column(name = "vector_id")
    private String vectorId;

    // Trạng thái hoạt động (true = đang hiển thị, false = đã ẩn)
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
}

