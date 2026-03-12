package com.chatbot.backend.repository;

import com.chatbot.backend.entity.Place;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaceRepository extends JpaRepository<Place, Integer> {
    List<Place> findAllByIsActiveTrue();
    List<Place> findByCategoryIdAndIsActiveTrue(Integer categoryId);
}
