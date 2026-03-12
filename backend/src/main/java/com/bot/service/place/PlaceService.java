package com.bot.service.place;

import com.bot.entity.Place;
import com.bot.entity.User;
import com.bot.entity.UserFavorite;
import com.bot.repository.PlaceRepository;
import com.bot.repository.UserFavoriteRepository;
import com.bot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceRepository placeRepository;
    private final UserFavoriteRepository userFavoriteRepository;
    private final UserRepository userRepository;

    public List<Place> getAllActivePlaces() {
        return placeRepository.findAllByIsActiveTrue();
    }

    public List<Place> getPlacesByCategory(Integer categoryId) {
        return placeRepository.findByCategoryIdAndIsActiveTrue(categoryId);
    }

    public List<Place> getUserFavorites(UUID userId) {
        List<UserFavorite> favorites = userFavoriteRepository.findAllByUserIdOrderBySavedAtDesc(userId);
        return favorites.stream().map(UserFavorite::getPlace).collect(Collectors.toList());
    }

    public UserFavorite addFavorite(UUID userId, Integer placeId) {
        if (userFavoriteRepository.existsByUserIdAndPlaceId(userId, placeId)) {
            throw new IllegalArgumentException("Already in favorites");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new IllegalArgumentException("Place not found"));

        UserFavorite favorite = UserFavorite.builder()
                .user(user)
                .place(place)
                .build();

        return userFavoriteRepository.save(favorite);
    }
    
    public void removeFavorite(UUID favoriteId) {
        userFavoriteRepository.deleteById(favoriteId);
    }
}
