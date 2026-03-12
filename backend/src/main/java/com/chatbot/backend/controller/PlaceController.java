package com.chatbot.backend.controller;

import com.chatbot.backend.entity.Place;
import com.chatbot.backend.entity.UserFavorite;
import com.chatbot.backend.service.PlaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    @GetMapping
    public ResponseEntity<List<Place>> getAllActivePlaces() {
        return ResponseEntity.ok(placeService.getAllActivePlaces());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Place>> getPlacesByCategoryId(@PathVariable Integer categoryId) {
        return ResponseEntity.ok(placeService.getPlacesByCategory(categoryId));
    }

    @GetMapping("/favorites/user/{userId}")
    public ResponseEntity<List<Place>> getUserFavorites(@PathVariable UUID userId) {
        return ResponseEntity.ok(placeService.getUserFavorites(userId));
    }

    @PostMapping("/favorites/user/{userId}/{placeId}")
    public ResponseEntity<UserFavorite> addFavorite(@PathVariable UUID userId, @PathVariable Integer placeId) {
        try {
            return ResponseEntity.ok(placeService.addFavorite(userId, placeId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/favorites/{favoriteId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable UUID favoriteId) {
        placeService.removeFavorite(favoriteId);
        return ResponseEntity.noContent().build();
    }
}
