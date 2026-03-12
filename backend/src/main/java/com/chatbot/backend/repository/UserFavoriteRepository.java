package com.chatbot.backend.repository;

import com.chatbot.backend.entity.UserFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserFavoriteRepository extends JpaRepository<UserFavorite, UUID> {
    List<UserFavorite> findAllByUserIdOrderBySavedAtDesc(UUID userId);
    boolean existsByUserIdAndPlaceId(UUID userId, Integer placeId);
}
