package com.bot.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Thực thể đại diện cho Danh mục địa điểm (VD: Ẩm thực, Du lịch, Khách sạn...).
 * Dùng để phân loại các địa điểm trong hệ thống.
 * 
 * NOTE: Hiện tại không sử dụng bảng categories trong database.
 * Category được lưu trực tiếp trong bảng places (category_vi, category_en).
 */
@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Tên hiển thị của danh mục (VD: "Địa điểm ăn uống")
    @Column(nullable = false)
    private String name;

    // Mã danh mục dùng trong logic/url (VD: "AM_THUC", "DU_LICH")
    @Column(nullable = false, unique = true)
    private String code;
}
