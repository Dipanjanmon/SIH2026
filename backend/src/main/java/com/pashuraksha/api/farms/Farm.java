package com.pashuraksha.api.farms;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;

@Entity
@Table(name = "farms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Farm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private com.pashuraksha.api.farmers.Farmer farmerId;

    @Column(nullable = false)
    private String name;

    private String village;
    private String block;
    private String district;
    private String state;

    private Double areaAcres;
    private Double latitude;
    private Double longitude;

    @JdbcTypeCode(SqlTypes.GEOMETRY)
    @Column(columnDefinition = "geometry(Point, 4326)")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private org.locationtech.jts.geom.Point location;

    @Builder.Default
    private Integer totalAnimals = 0;
}
