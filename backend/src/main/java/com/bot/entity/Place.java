package com.bot.entity;

import jakarta.persistence.*;
import lombok.*;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String location;

    private Float rating;

    @Column(name = "price_range")
    private String priceRange;

    @Column(name = "vector_id")
    private String vectorId;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
}

