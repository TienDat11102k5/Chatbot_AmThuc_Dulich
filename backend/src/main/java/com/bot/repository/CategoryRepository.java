package com.bot.repository;

import com.bot.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository thao tác CSDL cho bảng `categories`.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    
    // Tìm danh mục theo mã code (VD: "AM_THUC")
    Optional<Category> findByCode(String code);
}

