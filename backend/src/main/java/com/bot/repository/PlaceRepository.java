package com.bot.repository;

import com.bot.entity.Place;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaceRepository extends JpaRepository<Place, Integer> {
    List<Place> findAllByIsActiveTrue();
    List<Place> findByCategoryIdAndIsActiveTrue(Integer categoryId);
}

